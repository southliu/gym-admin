import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { Role } from '../../system/entities/role.entity';
import { Menu } from '../../system/entities/menu.entity';
import { User } from '../../system/entities/user.entity';
import { Permission } from '../../system/entities/permission.entity';
import { Coach } from '../../gym/entities/coach.entity';

/**
 * 启动时种子数据初始化。
 *
 * 角色（按名称，与 FastAPI init.sql 一致）：
 *   admin    - 超级管理员（拥有全部菜单）
 *   gym_admin - 健身房管理员（拥有全部健身房菜单）
 *   coach   - 教练
 *   member  - 会员
 *
 * 流程：
 *   1) 若 admin 账号不存在，执行 sql/init.sql，导入：
 *      - admin / admin123456（哈希与 FastAPI 完全一致）
 *      - admin、user 角色、37 项权限、约 45 项菜单、admin 的全部菜单授权
 *   2) 追加 coach、member 角色（幂等）
 *   3) 追加会员端、教练端菜单并授权给对应角色
 *   4) 保证 admin 拥有所有菜单（含新增的业务菜单）
 *   5) 创建示例 member、coach 账号，并建立教练账号 ↔ gym_coach 关联
 *   6) 导入健身房管理菜单（gym-init.sql），创建 gym_admin 角色
 *   7) 将健身房菜单授权给 coach 和 member 角色
 *
 * 通过环境变量 SEED_ENABLED=off 可关闭。
 */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  private readonly memberMenus = [
    { label: '会员中心', labelEn: 'Member', type: 1, icon: 'ion:people-outline', router: '/member', order: 100 },
    { label: '浏览课程', labelEn: 'Courses', type: 2, icon: 'ion:eye-outline', router: '/member/courses', order: 101 },
    { label: '我的预约', labelEn: 'My Bookings', type: 2, icon: 'ion:calendar-outline', router: '/member/bookings', order: 102 },
  ];
  private readonly coachMenus = [
    { label: '教练中心', labelEn: 'Coach', type: 1, icon: 'ion:fitness-outline', router: '/coach', order: 200 },
    { label: '我的课程', labelEn: 'My Courses', type: 2, icon: 'ion:book-outline', router: '/coach/courses', order: 201 },
    { label: '我的排班', labelEn: 'My Schedule', type: 2, icon: 'ion:calendar-number-outline', router: '/coach/schedule', order: 202 },
    { label: '我的课次', labelEn: 'My Sessions', type: 2, icon: 'ion:time-outline', router: '/coach/sessions', order: 203 },
  ];

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(Menu) private menuRepo: Repository<Menu>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Coach) private coachRepo: Repository<Coach>,
    @InjectRepository(Permission) private permissionRepo: Repository<Permission>,
  ) {}

  async onApplicationBootstrap() {
    if (process.env.SEED_ENABLED === 'off') {
      return;
    }
    try {
      await this.run();
    } catch (err) {
      this.logger.error(`种子数据初始化失败：${(err as Error).message}`);
    }
  }

  private async run() {
    // 1) 首次启动：导入 init.sql（admin 账号 + 全套 RBAC 菜单/权限）
    //    admin 账号的密码由 init.sql 决定（admin123456），不在代码里修复。
    const adminExists = await this.userRepo.exists({
      where: { username: 'admin' },
    });
    if (!adminExists) {
      await this.runInitSql();
      this.logger.log('已导入 sql/init.sql（admin/admin123456、角色、权限、菜单）');
    }

    // 2) 导入健身房管理菜单（sql/gym-init.sql），创建 gym_admin 角色
    await this.runGymInitSql();

    // 3) 追加教练、会员角色
    const coachRole = await this.ensureRole('coach', '教练');
    const memberRole = await this.ensureRole('member', '会员');

    // 4) 追加会员/教练菜单
    const memberMenuEntities = await this.ensureMenus(this.memberMenus);
    const coachMenuEntities = await this.ensureMenus(this.coachMenus);

    await this.assignMenus(memberRole, memberMenuEntities);
    await this.assignMenus(coachRole, coachMenuEntities);

    // 5) 将健身房管理菜单授权给 coach 和 member 角色
    await this.assignGymMenusToRoles(coachRole, memberRole);

    // 6) 保证 admin 拥有所有菜单（健身房管理 + 会员中心 + 教练中心）
    //    不按角色名硬编码：以 admin 用户实际绑定的角色为准（不同环境下超级管理员
    //    角色名可能是 'admin' 或 '系统管理员' 等），把全部业务菜单授权给它。
    const adminRoleForSeed = await this.resolveAdminRole();
    if (adminRoleForSeed) {
      await this.assignGymMenusToAdmin(adminRoleForSeed);
      await this.assignMenus(adminRoleForSeed, memberMenuEntities);
      await this.assignMenus(adminRoleForSeed, coachMenuEntities);
    } else {
      this.logger.warn('未找到 admin 用户或其角色，跳过 admin 菜单授权');
    }

    // 7) 示例会员/教练账号 + 教练档案关联
    const memberUser = await this.ensureUser({
      username: 'member',
      password: 'member123',
      name: '示例会员',
      phone: '13800000001',
      role: memberRole,
    });
    const coachUser = await this.ensureUser({
      username: 'coach',
      password: 'coach123',
      name: '示例教练',
      phone: '13800000002',
      role: coachRole,
    });
    await this.ensureCoachProfile(coachUser);

    this.logger.log('种子数据初始化完成');
  }

  /** 按 ; 切分并逐条执行 init.sql 中的语句。 */
  private async runInitSql() {
    const file = path.resolve(__dirname, '../../../init.sql');
    if (!fs.existsSync(file)) {
      this.logger.warn(`未找到 ${file}，跳过 init.sql 导入`);
      return;
    }
    const raw = fs.readFileSync(file, 'utf-8');
    // 去除 -- 注释行，按分号切分
    const statements = raw
      .split('\n')
      .filter((l) => !l.trim().startsWith('--'))
      .join('\n')
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !/^(START TRANSACTION|COMMIT)$/i.test(s));

    for (const stmt of statements) {
      await this.dataSource.query(stmt);
    }
  }

  /** 导入健身房管理菜单（sql/gym-init.sql），幂等。 */
  private async runGymInitSql() {
    const file = path.resolve(__dirname, '../../../sql/gym-init.sql');
    if (!fs.existsSync(file)) {
      this.logger.warn(`未找到 ${file}，跳过健身房菜单导入`);
      return;
    }
    const raw = fs.readFileSync(file, 'utf-8');
    const statements = raw
      .split('\n')
      .filter((l) => !l.trim().startsWith('--'))
      .join('\n')
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !/^(START TRANSACTION|COMMIT)$/i.test(s));

    for (const stmt of statements) {
      try {
        await this.dataSource.query(stmt);
      } catch (err) {
        // 幂等：忽略重复插入等错误
        this.logger.warn(`gym-init SQL 执行跳过：${(err as Error).message?.slice(0, 100)}`);
      }
    }
    this.logger.log('已导入健身房管理菜单');
  }

  /** 将健身房管理菜单（router LIKE /gym%）授权给教练和会员角色。 */
  private async assignGymMenusToRoles(coachRole: Role, _memberRole: Role): Promise<void> {
    // 获取所有健身房菜单
    const gymMenus = await this.menuRepo
      .createQueryBuilder('menu')
      .where('menu.router LIKE :pattern', { pattern: '/gym%' })
      .getMany();

    if (gymMenus.length === 0) return;

    // 教练角色：课程相关（只读）+ 排班管理（完整操作）
    const coachMenus = gymMenus.filter((m) => {
      return (
        m.label === '课程管理' ||
        m.label === '预约管理' ||
        m.label === '教练管理' ||
        m.label === '排班模板' ||
        m.label === '排班调班' ||
        m.label === '教练课程' ||
        // 按钮权限（课程管理下的只读按钮 + 排班管理下的操作按钮）
        (m.type === 3 &&
          ((m.router === '/gym/course' && ['课程列表', '查看课程', '查看课次'].includes(m.label)) ||
            (m.router === '/gym/booking' && ['预约列表', '查看预约'].includes(m.label)) ||
            (m.router === '/gym/coach' && ['教练列表', '查看教练', '查看排班'].includes(m.label)) ||
            (m.router === '/gym/coach-schedule-template' &&
              ['排班模板列表', '查看排班模板', '创建排班模板', '修改排班模板', '删除排班模板'].includes(m.label)) ||
            (m.router === '/gym/coach-schedule-override' &&
              ['排班调班列表', '查看排班调班', '创建排班调班', '修改排班调班'].includes(m.label)) ||
            (m.router === '/gym/coach-course' && ['教练课程列表', '查看教练课程'].includes(m.label))))
      );
    });

    // 会员角色不分配健身房管理菜单，仅通过会员中心（/member）使用门户功能

    // 给教练授权健身房管理顶级菜单 + 子菜单
    const topMenu = gymMenus.filter((m) => m.label === '健身房管理');
    const coachAll = [...topMenu, ...coachMenus];

    await this.assignMenus(coachRole, coachAll);
    this.logger.log('已授权健身房菜单给教练角色');
  }

  /** 将全部健身房管理菜单授权给 admin 角色。 */
  private async assignGymMenusToAdmin(adminRole: Role): Promise<void> {
    const gymMenus = await this.menuRepo
      .createQueryBuilder('menu')
      .where('menu.router LIKE :pattern', { pattern: '/gym%' })
      .getMany();

    if (gymMenus.length === 0) return;
    await this.assignMenus(adminRole, gymMenus);
    this.logger.log('已授权健身房菜单给 admin 角色');
  }

  private async ensureRole(name: string, description: string): Promise<Role> {
    // 优先按 description 查找（匹配 init.sql 创建的中文角色名如 '教练'/'会员'）
    // 再按 name 查找（如 'coach'/'member'），避免创建重复角色
    let role = await this.roleRepo.findOne({ where: { description } });
    if (!role) {
      role = await this.roleRepo.findOne({ where: { name } });
    }
    if (!role) {
      role = this.roleRepo.create({ name, description });
      role = await this.roleRepo.save(role);
      this.logger.log(`创建角色：${name} (id=${role.id})`);
    }
    return role;
  }

  /**
   * 解析 admin 用户实际绑定的角色，作为"超级管理员"授权目标。
   * 优先取 admin 用户绑定的第一个角色；若没有则回退到名为 'admin' 的角色。
   */
  private async resolveAdminRole(): Promise<Role | null> {
    const adminUser = await this.userRepo.findOne({
      where: { username: 'admin' },
      relations: ['roles'],
    });
    const roles = adminUser?.roles ?? [];
    if (roles.length > 0) {
      return roles[0];
    }
    const fallback = await this.roleRepo.findOne({ where: { name: 'admin' } });
    return fallback ?? null;
  }

  /** 创建目录/菜单（type 1/2）。幂等：按 router 去重。type=2 菜单自动创建对应权限并回填。 */
  private async ensureMenus(
    defs: { label: string; labelEn: string; type: number; icon: string; router: string; order: number }[],
  ): Promise<Menu[]> {
    const result: Menu[] = [];
    let parent: Menu | null = null;

    for (const def of defs) {
      let menu = await this.menuRepo.findOne({
        where: { router: def.router },
        relations: ['permission'],
      });

      // type=1（目录）或 type=2（菜单）确保有对应权限（无论菜单是否已存在）
      let permission: Permission | null = null;
      if ((def.type === 1 || def.type === 2) && def.router) {
        permission = await this.permissionRepo.findOne({
          where: { name: def.router },
        });
        if (!permission) {
          permission = this.permissionRepo.create({
            name: def.router,
            description: def.label,
          });
          permission = await this.permissionRepo.save(permission);
          this.logger.log(`创建权限：${def.router}`);
        }
      }

      if (!menu) {
        const toSave = this.menuRepo.create({
          label: def.label,
          labelEn: def.labelEn,
          type: def.type,
          icon: def.icon,
          router: def.router,
          order: def.order,
          state: 1,
          permission: permission || undefined,
        });
        if (def.type !== 1 && parent) {
          toSave.parent = parent;
        }
        menu = await this.menuRepo.save(toSave);
        this.logger.log(`创建菜单：${def.label} (${def.router})`);
      } else if (!menu.permission && permission) {
        // 回填：已存在的菜单缺少权限关联
        menu.permission = permission;
        menu = await this.menuRepo.save(menu);
        this.logger.log(`回填权限：${def.label} → ${def.router}`);
      }

      if (def.type === 1) {
        parent = menu;
      }
      result.push(menu);
    }
    return result;
  }

  /** 把菜单授权给角色（合并已有授权，幂等）。 */
  private async assignMenus(role: Role, menus: Menu[]): Promise<void> {
    const fresh = await this.roleRepo.findOne({
      where: { id: role.id },
      relations: ['menus'],
    });
    if (!fresh) return;
    const existing = new Set((fresh.menus ?? []).map((m) => m.id));
    const toAdd = menus.filter((m) => !existing.has(m.id));
    if (toAdd.length === 0) return;
    fresh.menus = [...(fresh.menus ?? []), ...toAdd];
    await this.roleRepo.save(fresh);
  }

  private async ensureUser(input: {
    username: string;
    password: string;
    name: string;
    phone: string;
    role: Role;
  }): Promise<User> {
    let user = await this.userRepo.findOne({
      where: { username: input.username },
      relations: ['roles'],
    });
    if (!user) {
      const hashed = await bcrypt.hash(input.password, 10);
      user = this.userRepo.create({
        username: input.username,
        password: hashed,
        name: input.name,
        phone: input.phone,
        status: 1,
      });
      user.roles = [input.role];
      user = await this.userRepo.save(user);
      this.logger.log(`创建账号：${input.username} / ${input.password}`);
    } else {
      // 用户已存在：确保角色关联和名称正确
      const hasRole = user.roles?.some((r) => r.id === input.role.id);
      let needSave = false;
      if (!hasRole) {
        user.roles = [input.role, ...(user.roles ?? [])];
        needSave = true;
        this.logger.log(`已修正账号角色：${input.username} -> ${input.role.name}`);
      }
      // 修正乱码名称（历史数据可能因编码问题存入乱码）
      if (user.name !== input.name) {
        user.name = input.name;
        needSave = true;
      }
      if (needSave) {
        await this.userRepo.save(user);
      }
    }
    return user;
  }

  private async ensureCoachProfile(user: User): Promise<void> {
    const existing = await this.coachRepo.findOne({
      where: { userId: user.id, isDeleted: 0 },
    });
    if (existing) return;
    const coach = this.coachRepo.create({
      name: user.name ?? '教练',
      phone: user.phone ?? null,
      status: 1,
      userId: user.id,
    });
    await this.coachRepo.save(coach);
    this.logger.log(`关联教练档案：userId=${user.id} -> coachId=${coach.id}`);
  }
}
