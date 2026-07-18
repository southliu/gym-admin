import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { Role } from '../../system/entities/role.entity';
import { Menu } from '../../system/entities/menu.entity';
import { User } from '../../system/entities/user.entity';
import { Coach } from '../../gym/entities/coach.entity';

/**
 * 启动时种子数据初始化。
 *
 * 角色（按名称，与 FastAPI init.sql 一致）：
 *   admin   - 超级管理员（拥有全部菜单）
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
 *
 * 通过环境变量 SEED_ENABLED=off 可关闭。
 */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  private readonly memberMenus = [
    { label: '会员中心', labelEn: 'Member', type: 1, icon: 'mdi:account-group', router: '/member', order: 100 },
    { label: '浏览课程', labelEn: 'Courses', type: 2, icon: 'mdi:dumbbell', router: '/member/courses', order: 101 },
    { label: '我的预约', labelEn: 'My Bookings', type: 2, icon: 'mdi:calendar-clock', router: '/member/bookings', order: 102 },
  ];
  private readonly coachMenus = [
    { label: '教练中心', labelEn: 'Coach', type: 1, icon: 'mdi:whistle', router: '/coach', order: 200 },
    { label: '我的课程', labelEn: 'My Courses', type: 2, icon: 'mdi:book-open-variant', router: '/coach/courses', order: 201 },
    { label: '我的排班', labelEn: 'My Schedule', type: 2, icon: 'mdi:calendar-month', router: '/coach/schedule', order: 202 },
    { label: '我的课次', labelEn: 'My Sessions', type: 2, icon: 'mdi:timetable', router: '/coach/sessions', order: 203 },
  ];

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(Menu) private menuRepo: Repository<Menu>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Coach) private coachRepo: Repository<Coach>,
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

    // 2) 追加教练、会员角色
    const coachRole = await this.ensureRole('coach', '教练');
    const memberRole = await this.ensureRole('member', '会员');

    // 3) 追加会员/教练菜单
    const memberMenuEntities = await this.ensureMenus(this.memberMenus);
    const coachMenuEntities = await this.ensureMenus(this.coachMenus);

    await this.assignMenus(memberRole, memberMenuEntities);
    await this.assignMenus(coachRole, coachMenuEntities);

    // 4) 示例会员/教练账号 + 教练档案关联
    const memberUser = await this.ensureUser({
      username: 'member',
      password: '123456',
      name: '示例会员',
      phone: '13800000001',
      role: memberRole,
    });
    const coachUser = await this.ensureUser({
      username: 'coach',
      password: '123456',
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

  private async ensureRole(name: string, description: string): Promise<Role> {
    let role = await this.roleRepo.findOne({ where: { name } });
    if (!role) {
      role = this.roleRepo.create({ name, description });
      role = await this.roleRepo.save(role);
      this.logger.log(`创建角色：${name} (id=${role.id})`);
    }
    return role;
  }

  /** 创建目录/菜单（type 1/2）。幂等：按 router 去重。返回创建或已存在的菜单实体。 */
  private async ensureMenus(
    defs: { label: string; labelEn: string; type: number; icon: string; router: string; order: number }[],
  ): Promise<Menu[]> {
    const result: Menu[] = [];
    let parent: Menu | null = null;

    for (const def of defs) {
      let menu = await this.menuRepo.findOne({ where: { router: def.router } });
      if (!menu) {
        const toSave = this.menuRepo.create({
          label: def.label,
          labelEn: def.labelEn,
          type: def.type,
          icon: def.icon,
          router: def.router,
          order: def.order,
          state: 1,
        });
        if (def.type !== 1 && parent) {
          toSave.parent = parent;
        }
        menu = await this.menuRepo.save(toSave);
        this.logger.log(`创建菜单：${def.label} (${def.router})`);
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
