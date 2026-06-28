# 教练排班模块 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a coach scheduling module with coach management, weekly schedule templates, schedule overrides, and coach-course assignment for a gym admin system.

**Architecture:** Coach entity is the core, with three satellite entities (Template, Override, CoachCourse). Course entity's `instructor` text field is replaced with `coachId` FK. All patterns follow existing gym module conventions (CourseType module for simple CRUD, Course module for complex logic).

**Tech Stack:** NestJS 10, TypeORM 0.3, MySQL, React 19, Ant Design 5, Zustand, TypeScript, pnpm workspaces

## Global Constraints

- All backend entities extend `BaseEntity` from `src/common/entities/base.entity.ts`
- Soft-delete pattern: set `isDeleted = 1` and `deletedAt = new Date()`, never hard-delete
- API routes follow verb-style: `/page`, `/list`, `/detail?id=`, `/create`, `/update/:id`, `/:id` (DELETE)
- Response automatically wrapped by `ResponseInterceptor` — return raw data, not `ApiResponse`
- Frontend uses auto-imports (no explicit React/BaseComponent imports needed)
- Frontend forms use `BaseFormList[]` schema with `component` string mapping
- Permission prefix pattern: `/gym/coach`, `/gym/coach-schedule-template`, etc.
- No test infrastructure — verify by running dev servers and manual testing

---

## File Structure

### Backend files (all under `D:\case\gym-admin\south-admin-nest\src\gym\`)

| File | Responsibility |
|------|---------------|
| `entities/coach.entity.ts` | Coach entity |
| `entities/coach-schedule-template.entity.ts` | CoachScheduleTemplate entity |
| `entities/coach-schedule-override.entity.ts` | CoachScheduleOverride entity |
| `entities/coach-course.entity.ts` | CoachCourse entity |
| `dto/coach.dto.ts` | Create/Update DTOs for Coach |
| `dto/coach-schedule-template.dto.ts` | Create/Update/BatchGenerate DTOs for Template |
| `dto/coach-schedule-override.dto.ts` | Create/Update DTOs for Override |
| `dto/coach-course.dto.ts` | Create DTO for CoachCourse |
| `coach/coach.module.ts` | Coach NestJS module |
| `coach/coach.controller.ts` | Coach controller |
| `coach/coach.service.ts` | Coach service |
| `coach-schedule-template/coach-schedule-template.module.ts` | Template module |
| `coach-schedule-template/coach-schedule-template.controller.ts` | Template controller |
| `coach-schedule-template/coach-schedule-template.service.ts` | Template service (with batchGenerate) |
| `coach-schedule-override/coach-schedule-override.module.ts` | Override module |
| `coach-schedule-override/coach-schedule-override.controller.ts` | Override controller |
| `coach-schedule-override/coach-schedule-override.service.ts` | Override service |
| `coach-course/coach-course.module.ts` | CoachCourse module |
| `coach-course/coach-course.controller.ts` | CoachCourse controller |
| `coach-course/coach-course.service.ts` | CoachCourse service |

### Files to modify

| File | Change |
|------|--------|
| `entities/course.entity.ts` | Replace `instructor` with `coachId` |
| `gym.module.ts` | Add 4 new sub-module imports |
| `app.module.ts` | Add 4 new entities to TypeORM config |

### Frontend files (all under `D:\case\gym-admin\south-admin-react\src\`)

| File | Responsibility |
|------|---------------|
| `servers/gym/coach.ts` | Coach API calls |
| `servers/gym/coach-schedule-template.ts` | Template API calls |
| `servers/gym/coach-schedule-override.ts` | Override API calls |
| `servers/gym/coach-course.ts` | CoachCourse API calls |
| `pages/gym/coach/model.tsx` | Coach search/table/form config |
| `pages/gym/coach/index.tsx` | Coach CRUD page with schedule drawer |
| `pages/gym/coach-schedule-template/model.ts` | Template search/table/form config |
| `pages/gym/coach-schedule-template/index.tsx` | Template CRUD page |
| `pages/gym/coach-schedule-override/model.ts` | Override search/table/form config |
| `pages/gym/coach-schedule-override/index.tsx` | Override CRUD page |
| `pages/gym/coach-course/model.ts` | CoachCourse search/table/form config |
| `pages/gym/coach-course/index.tsx` | CoachCourse CRUD page |

---

## Task 1: Coach Backend

**Files:**
- Create: `src/gym/entities/coach.entity.ts`
- Create: `src/gym/dto/coach.dto.ts`
- Create: `src/gym/coach/coach.module.ts`
- Create: `src/gym/coach/coach.controller.ts`
- Create: `src/gym/coach/coach.service.ts`

**Interfaces:**
- Consumes: `BaseEntity`, `PaginationDto`
- Produces: `Coach` entity, `CoachService` (exported)

- [ ] **Step 1: Create Coach entity**

```ts
// src/gym/entities/coach.entity.ts
import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('gym_coach')
export class Coach extends BaseEntity {
  @Column({ length: 50 })
  name: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ type: 'int', nullable: true, comment: '1=男 2=女' })
  gender: number;

  @Column({ length: 255, nullable: true })
  specialties: string;

  @Column({ type: 'text', nullable: true })
  qualifications: string;

  @Column({ length: 255, nullable: true })
  avatar: string;

  @Column({ type: 'int', default: 1, comment: '1=在职 2=离职' })
  status: number;
}
```

- [ ] **Step 2: Create Coach DTOs**

```ts
// src/gym/dto/coach.dto.ts
import { IsString, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCoachDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  gender?: number;

  @IsOptional()
  @IsString()
  specialties?: string;

  @IsOptional()
  @IsString()
  qualifications?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;
}

export class UpdateCoachDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  gender?: number;

  @IsOptional()
  @IsString()
  specialties?: string;

  @IsOptional()
  @IsString()
  qualifications?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;
}
```

- [ ] **Step 3: Create Coach service**

```ts
// src/gym/coach/coach.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coach } from '../entities/coach.entity';
import { CreateCoachDto, UpdateCoachDto } from '../dto/coach.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class CoachService {
  constructor(
    @InjectRepository(Coach)
    private coachRepository: Repository<Coach>,
  ) {}

  async page(dto: PaginationDto & { name?: string; status?: number; specialties?: string }) {
    const { page = 1, pageSize = 10, name, status, specialties } = dto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.coachRepository
      .createQueryBuilder('coach')
      .where('coach.isDeleted = :isDeleted', { isDeleted: 0 });

    if (name) {
      queryBuilder.andWhere('coach.name LIKE :name', { name: `%${name}%` });
    }
    if (status !== undefined) {
      queryBuilder.andWhere('coach.status = :status', { status });
    }
    if (specialties) {
      queryBuilder.andWhere('coach.specialties LIKE :specialties', {
        specialties: `%${specialties}%`,
      });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .orderBy('coach.createdAt', 'DESC')
      .getManyAndCount();

    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }

  async detail(id: number) {
    const coach = await this.coachRepository.findOne({ where: { id } });
    if (!coach || coach.isDeleted === 1) {
      throw new NotFoundException('教练不存在');
    }
    return coach;
  }

  async list() {
    return await this.coachRepository.find({
      where: { isDeleted: 0, status: 1 },
      select: ['id', 'name', 'specialties'],
    });
  }

  async create(dto: CreateCoachDto) {
    const coach = this.coachRepository.create({
      name: dto.name,
      phone: dto.phone,
      gender: dto.gender,
      specialties: dto.specialties,
      qualifications: dto.qualifications,
      avatar: dto.avatar,
      status: dto.status ?? 1,
    });
    return await this.coachRepository.save(coach);
  }

  async update(id: number, dto: UpdateCoachDto) {
    const coach = await this.coachRepository.findOne({ where: { id } });
    if (!coach || coach.isDeleted === 1) {
      throw new NotFoundException('教练不存在');
    }
    if (dto.name !== undefined) coach.name = dto.name;
    if (dto.phone !== undefined) coach.phone = dto.phone;
    if (dto.gender !== undefined) coach.gender = dto.gender;
    if (dto.specialties !== undefined) coach.specialties = dto.specialties;
    if (dto.qualifications !== undefined) coach.qualifications = dto.qualifications;
    if (dto.avatar !== undefined) coach.avatar = dto.avatar;
    if (dto.status !== undefined) coach.status = dto.status;
    return await this.coachRepository.save(coach);
  }

  async delete(id: number) {
    const coach = await this.coachRepository.findOne({ where: { id } });
    if (!coach || coach.isDeleted === 1) {
      throw new NotFoundException('教练不存在');
    }
    coach.isDeleted = 1;
    coach.deletedAt = new Date();
    await this.coachRepository.save(coach);
  }
}
```

- [ ] **Step 4: Create Coach controller**

```ts
// src/gym/coach/coach.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Query, Param } from '@nestjs/common';
import { CoachService } from './coach.service';
import { CreateCoachDto, UpdateCoachDto } from '../dto/coach.dto';

@Controller('gym/coach')
export class CoachController {
  constructor(private readonly coachService: CoachService) {}

  @Get('page')
  async page(@Query() dto: any) {
    return await this.coachService.page(dto);
  }

  @Get('list')
  async list() {
    return await this.coachService.list();
  }

  @Get('detail')
  async detail(@Query('id') id: number) {
    return await this.coachService.detail(id);
  }

  @Post('create')
  async create(@Body() dto: CreateCoachDto) {
    return await this.coachService.create(dto);
  }

  @Put('update/:id')
  async update(@Param('id') id: number, @Body() dto: UpdateCoachDto) {
    return await this.coachService.update(id, dto);
  }

  @Delete('/:id')
  async delete(@Param('id') id: number) {
    await this.coachService.delete(id);
    return { message: '删除成功' };
  }
}
```

- [ ] **Step 5: Create Coach module**

```ts
// src/gym/coach/coach.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoachController } from './coach.controller';
import { CoachService } from './coach.service';
import { Coach } from '../entities/coach.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Coach])],
  controllers: [CoachController],
  providers: [CoachService],
  exports: [CoachService],
})
export class CoachModule {}
```

- [ ] **Step 6: Verify and commit**

Run: `cd D:/case/gym-admin/south-admin-nest && pnpm run build`
Expected: Build succeeds with 0 errors.

```bash
cd D:/case/gym-admin/south-admin-nest
git add src/gym/entities/coach.entity.ts src/gym/dto/coach.dto.ts src/gym/coach/
git commit -m "feat: add coach backend module"
```

---

## Task 2: CoachScheduleTemplate Backend

**Files:**
- Create: `src/gym/entities/coach-schedule-template.entity.ts`
- Create: `src/gym/dto/coach-schedule-template.dto.ts`
- Create: `src/gym/coach-schedule-template/coach-schedule-template.module.ts`
- Create: `src/gym/coach-schedule-template/coach-schedule-template.controller.ts`
- Create: `src/gym/coach-schedule-template/coach-schedule-template.service.ts`

**Interfaces:**
- Consumes: `BaseEntity`, `PaginationDto`, `Coach` entity
- Produces: `CoachScheduleTemplate` entity, `CoachScheduleTemplateService` (exported)

- [ ] **Step 1: Create CoachScheduleTemplate entity**

```ts
// src/gym/entities/coach-schedule-template.entity.ts
import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('gym_coach_schedule_template')
export class CoachScheduleTemplate extends BaseEntity {
  @Column({ type: 'bigint' })
  coachId: number;

  @Column({ type: 'int', comment: '1=周一 ~ 7=周日' })
  dayOfWeek: number;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;
}
```

- [ ] **Step 2: Create DTOs**

```ts
// src/gym/dto/coach-schedule-template.dto.ts
import { IsInt, IsString, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCoachScheduleTemplateDto {
  @Type(() => Number)
  @IsInt()
  coachId: number;

  @Type(() => Number)
  @IsInt()
  dayOfWeek: number;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;
}

export class UpdateCoachScheduleTemplateDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  dayOfWeek?: number;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;
}

export class BatchGenerateDto {
  @Type(() => Number)
  @IsInt()
  coachId: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
```

- [ ] **Step 3: Create Template service**

```ts
// src/gym/coach-schedule-template/coach-schedule-template.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CoachScheduleTemplate } from '../entities/coach-schedule-template.entity';
import { CoachScheduleOverride } from '../entities/coach-schedule-override.entity';
import {
  CreateCoachScheduleTemplateDto,
  UpdateCoachScheduleTemplateDto,
  BatchGenerateDto,
} from '../dto/coach-schedule-template.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class CoachScheduleTemplateService {
  constructor(
    @InjectRepository(CoachScheduleTemplate)
    private templateRepository: Repository<CoachScheduleTemplate>,
    @InjectRepository(CoachScheduleOverride)
    private overrideRepository: Repository<CoachScheduleOverride>,
  ) {}

  async page(dto: PaginationDto & { coachId?: number; dayOfWeek?: number }) {
    const { page = 1, pageSize = 10, coachId, dayOfWeek } = dto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.templateRepository
      .createQueryBuilder('template')
      .where('template.isDeleted = :isDeleted', { isDeleted: 0 });

    if (coachId) {
      queryBuilder.andWhere('template.coachId = :coachId', { coachId });
    }
    if (dayOfWeek) {
      queryBuilder.andWhere('template.dayOfWeek = :dayOfWeek', { dayOfWeek });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .orderBy('template.dayOfWeek', 'ASC')
      .addOrderBy('template.startTime', 'ASC')
      .getManyAndCount();

    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }

  async create(dto: CreateCoachScheduleTemplateDto) {
    // Check for time conflict on same coach + day
    const existing = await this.templateRepository.findOne({
      where: {
        coachId: dto.coachId,
        dayOfWeek: dto.dayOfWeek,
        isDeleted: 0,
      },
    });

    if (existing) {
      throw new BadRequestException('该时段已有排班模板');
    }

    const template = this.templateRepository.create({
      coachId: dto.coachId,
      dayOfWeek: dto.dayOfWeek,
      startTime: dto.startTime,
      endTime: dto.endTime,
    });
    return await this.templateRepository.save(template);
  }

  async update(id: number, dto: UpdateCoachScheduleTemplateDto) {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template || template.isDeleted === 1) {
      throw new NotFoundException('排班模板不存在');
    }
    if (dto.dayOfWeek !== undefined) template.dayOfWeek = dto.dayOfWeek;
    if (dto.startTime !== undefined) template.startTime = dto.startTime;
    if (dto.endTime !== undefined) template.endTime = dto.endTime;
    return await this.templateRepository.save(template);
  }

  async delete(id: number) {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template || template.isDeleted === 1) {
      throw new NotFoundException('排班模板不存在');
    }
    template.isDeleted = 1;
    template.deletedAt = new Date();
    await this.templateRepository.save(template);
  }

  async batchGenerate(dto: BatchGenerateDto) {
    const templates = await this.templateRepository.find({
      where: { coachId: dto.coachId, isDeleted: 0 },
    });

    if (!templates.length) {
      throw new BadRequestException('该教练没有排班模板');
    }

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    // Get overrides (type=1 = leave) to skip
    const overrides = await this.overrideRepository.find({
      where: {
        coachId: dto.coachId,
        type: 1,
        isDeleted: 0,
      },
    });
    const leaveDates = new Set(
      overrides.map((o) => new Date(o.overrideDate).toISOString().split('T')[0]),
    );

    const records: CoachScheduleTemplate[] = [];
    const current = new Date(start);

    while (current <= end) {
      const dayOfWeek = current.getDay() === 0 ? 7 : current.getDay(); // JS: 0=Sun → 7
      const dateStr = current.toISOString().split('T')[0];

      if (!leaveDates.has(dateStr)) {
        const matchingTemplates = templates.filter((t) => t.dayOfWeek === dayOfWeek);
        for (const tmpl of matchingTemplates) {
          records.push(
            this.templateRepository.create({
              coachId: dto.coachId,
              dayOfWeek: tmpl.dayOfWeek,
              startTime: tmpl.startTime,
              endTime: tmpl.endTime,
            }),
          );
        }
      }

      current.setDate(current.getDate() + 1);
    }

    if (records.length) {
      await this.templateRepository.save(records);
    }

    return { generated: records.length };
  }
}
```

- [ ] **Step 4: Create Template controller**

```ts
// src/gym/coach-schedule-template/coach-schedule-template.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Query, Param } from '@nestjs/common';
import { CoachScheduleTemplateService } from './coach-schedule-template.service';
import {
  CreateCoachScheduleTemplateDto,
  UpdateCoachScheduleTemplateDto,
  BatchGenerateDto,
} from '../dto/coach-schedule-template.dto';

@Controller('gym/coach-schedule-template')
export class CoachScheduleTemplateController {
  constructor(private readonly service: CoachScheduleTemplateService) {}

  @Get('page')
  async page(@Query() dto: any) {
    return await this.service.page(dto);
  }

  @Post('create')
  async create(@Body() dto: CreateCoachScheduleTemplateDto) {
    return await this.service.create(dto);
  }

  @Put('update/:id')
  async update(@Param('id') id: number, @Body() dto: UpdateCoachScheduleTemplateDto) {
    return await this.service.update(id, dto);
  }

  @Delete('/:id')
  async delete(@Param('id') id: number) {
    await this.service.delete(id);
    return { message: '删除成功' };
  }

  @Post('batchGenerate')
  async batchGenerate(@Body() dto: BatchGenerateDto) {
    return await this.service.batchGenerate(dto);
  }
}
```

- [ ] **Step 5: Create Template module**

```ts
// src/gym/coach-schedule-template/coach-schedule-template.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoachScheduleTemplateController } from './coach-schedule-template.controller';
import { CoachScheduleTemplateService } from './coach-schedule-template.service';
import { CoachScheduleTemplate } from '../entities/coach-schedule-template.entity';
import { CoachScheduleOverride } from '../entities/coach-schedule-override.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CoachScheduleTemplate, CoachScheduleOverride])],
  controllers: [CoachScheduleTemplateController],
  providers: [CoachScheduleTemplateService],
  exports: [CoachScheduleTemplateService],
})
export class CoachScheduleTemplateModule {}
```

- [ ] **Step 6: Verify and commit**

Run: `cd D:/case/gym-admin/south-admin-nest && pnpm run build`

```bash
cd D:/case/gym-admin/south-admin-nest
git add src/gym/entities/coach-schedule-template.entity.ts src/gym/dto/coach-schedule-template.dto.ts src/gym/coach-schedule-template/
git commit -m "feat: add coach schedule template backend module"
```

---

## Task 3: CoachScheduleOverride Backend

**Files:**
- Create: `src/gym/entities/coach-schedule-override.entity.ts`
- Create: `src/gym/dto/coach-schedule-override.dto.ts`
- Create: `src/gym/coach-schedule-override/coach-schedule-override.module.ts`
- Create: `src/gym/coach-schedule-override/coach-schedule-override.controller.ts`
- Create: `src/gym/coach-schedule-override/coach-schedule-override.service.ts`

**Interfaces:**
- Consumes: `BaseEntity`, `PaginationDto`, `Coach` entity
- Produces: `CoachScheduleOverride` entity, `CoachScheduleOverrideService`

- [ ] **Step 1: Create CoachScheduleOverride entity**

```ts
// src/gym/entities/coach-schedule-override.entity.ts
import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('gym_coach_schedule_override')
export class CoachScheduleOverride extends BaseEntity {
  @Column({ type: 'bigint' })
  coachId: number;

  @Column({ type: 'date' })
  overrideDate: Date;

  @Column({ type: 'int', comment: '1=请假 2=加班 3=换班' })
  type: number;

  @Column({ type: 'time', nullable: true })
  startTime: string;

  @Column({ type: 'time', nullable: true })
  endTime: string;

  @Column({ length: 255, nullable: true })
  reason: string;
}
```

- [ ] **Step 2: Create DTOs**

```ts
// src/gym/dto/coach-schedule-override.dto.ts
import { IsInt, IsString, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCoachScheduleOverrideDto {
  @Type(() => Number)
  @IsInt()
  coachId: number;

  @IsDateString()
  overrideDate: string;

  @Type(() => Number)
  @IsInt()
  type: number;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateCoachScheduleOverrideDto {
  @IsOptional()
  @IsDateString()
  overrideDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  type?: number;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
```

- [ ] **Step 3: Create Override service**

```ts
// src/gym/coach-schedule-override/coach-schedule-override.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoachScheduleOverride } from '../entities/coach-schedule-override.entity';
import {
  CreateCoachScheduleOverrideDto,
  UpdateCoachScheduleOverrideDto,
} from '../dto/coach-schedule-override.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class CoachScheduleOverrideService {
  constructor(
    @InjectRepository(CoachScheduleOverride)
    private overrideRepository: Repository<CoachScheduleOverride>,
  ) {}

  async page(
    dto: PaginationDto & { coachId?: number; overrideDate?: string; type?: number },
  ) {
    const { page = 1, pageSize = 10, coachId, overrideDate, type } = dto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.overrideRepository
      .createQueryBuilder('override')
      .where('override.isDeleted = :isDeleted', { isDeleted: 0 });

    if (coachId) {
      queryBuilder.andWhere('override.coachId = :coachId', { coachId });
    }
    if (overrideDate) {
      queryBuilder.andWhere('override.overrideDate = :overrideDate', { overrideDate });
    }
    if (type !== undefined) {
      queryBuilder.andWhere('override.type = :type', { type });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .orderBy('override.overrideDate', 'DESC')
      .getManyAndCount();

    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }

  async create(dto: CreateCoachScheduleOverrideDto) {
    const override = this.overrideRepository.create({
      coachId: dto.coachId,
      overrideDate: new Date(dto.overrideDate),
      type: dto.type,
      startTime: dto.startTime,
      endTime: dto.endTime,
      reason: dto.reason,
    });
    return await this.overrideRepository.save(override);
  }

  async update(id: number, dto: UpdateCoachScheduleOverrideDto) {
    const override = await this.overrideRepository.findOne({ where: { id } });
    if (!override || override.isDeleted === 1) {
      throw new NotFoundException('排班调整不存在');
    }
    if (dto.overrideDate !== undefined) override.overrideDate = new Date(dto.overrideDate);
    if (dto.type !== undefined) override.type = dto.type;
    if (dto.startTime !== undefined) override.startTime = dto.startTime;
    if (dto.endTime !== undefined) override.endTime = dto.endTime;
    if (dto.reason !== undefined) override.reason = dto.reason;
    return await this.overrideRepository.save(override);
  }

  async delete(id: number) {
    const override = await this.overrideRepository.findOne({ where: { id } });
    if (!override || override.isDeleted === 1) {
      throw new NotFoundException('排班调整不存在');
    }
    override.isDeleted = 1;
    override.deletedAt = new Date();
    await this.overrideRepository.save(override);
  }
}
```

- [ ] **Step 4: Create Override controller**

```ts
// src/gym/coach-schedule-override/coach-schedule-override.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Query, Param } from '@nestjs/common';
import { CoachScheduleOverrideService } from './coach-schedule-override.service';
import {
  CreateCoachScheduleOverrideDto,
  UpdateCoachScheduleOverrideDto,
} from '../dto/coach-schedule-override.dto';

@Controller('gym/coach-schedule-override')
export class CoachScheduleOverrideController {
  constructor(private readonly service: CoachScheduleOverrideService) {}

  @Get('page')
  async page(@Query() dto: any) {
    return await this.service.page(dto);
  }

  @Post('create')
  async create(@Body() dto: CreateCoachScheduleOverrideDto) {
    return await this.service.create(dto);
  }

  @Put('update/:id')
  async update(@Param('id') id: number, @Body() dto: UpdateCoachScheduleOverrideDto) {
    return await this.service.update(id, dto);
  }

  @Delete('/:id')
  async delete(@Param('id') id: number) {
    await this.service.delete(id);
    return { message: '删除成功' };
  }
}
```

- [ ] **Step 5: Create Override module**

```ts
// src/gym/coach-schedule-override/coach-schedule-override.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoachScheduleOverrideController } from './coach-schedule-override.controller';
import { CoachScheduleOverrideService } from './coach-schedule-override.service';
import { CoachScheduleOverride } from '../entities/coach-schedule-override.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CoachScheduleOverride])],
  controllers: [CoachScheduleOverrideController],
  providers: [CoachScheduleOverrideService],
  exports: [CoachScheduleOverrideService],
})
export class CoachScheduleOverrideModule {}
```

- [ ] **Step 6: Verify and commit**

```bash
cd D:/case/gym-admin/south-admin-nest
git add src/gym/entities/coach-schedule-override.entity.ts src/gym/dto/coach-schedule-override.dto.ts src/gym/coach-schedule-override/
git commit -m "feat: add coach schedule override backend module"
```

---

## Task 4: CoachCourse Backend

**Files:**
- Create: `src/gym/entities/coach-course.entity.ts`
- Create: `src/gym/dto/coach-course.dto.ts`
- Create: `src/gym/coach-course/coach-course.module.ts`
- Create: `src/gym/coach-course/coach-course.controller.ts`
- Create: `src/gym/coach-course/coach-course.service.ts`

**Interfaces:**
- Consumes: `BaseEntity`, `PaginationDto`
- Produces: `CoachCourse` entity, `CoachCourseService`

- [ ] **Step 1: Create CoachCourse entity**

```ts
// src/gym/entities/coach-course.entity.ts
import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('gym_coach_course')
export class CoachCourse extends BaseEntity {
  @Column({ type: 'bigint' })
  coachId: number;

  @Column({ type: 'bigint' })
  courseId: number;
}
```

- [ ] **Step 2: Create DTOs**

```ts
// src/gym/dto/coach-course.dto.ts
import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCoachCourseDto {
  @Type(() => Number)
  @IsInt()
  coachId: number;

  @Type(() => Number)
  @IsInt()
  courseId: number;
}
```

- [ ] **Step 3: Create CoachCourse service**

```ts
// src/gym/coach-course/coach-course.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoachCourse } from '../entities/coach-course.entity';
import { CreateCoachCourseDto } from '../dto/coach-course.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class CoachCourseService {
  constructor(
    @InjectRepository(CoachCourse)
    private coachCourseRepository: Repository<CoachCourse>,
  ) {}

  async page(dto: PaginationDto & { coachId?: number; courseId?: number }) {
    const { page = 1, pageSize = 10, coachId, courseId } = dto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.coachCourseRepository
      .createQueryBuilder('cc')
      .where('cc.isDeleted = :isDeleted', { isDeleted: 0 });

    if (coachId) {
      queryBuilder.andWhere('cc.coachId = :coachId', { coachId });
    }
    if (courseId) {
      queryBuilder.andWhere('cc.courseId = :courseId', { courseId });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .orderBy('cc.createdAt', 'DESC')
      .getManyAndCount();

    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }

  async create(dto: CreateCoachCourseDto) {
    // Check duplicate
    const existing = await this.coachCourseRepository.findOne({
      where: {
        coachId: dto.coachId,
        courseId: dto.courseId,
        isDeleted: 0,
      },
    });
    if (existing) {
      throw new BadRequestException('该教练已关联此课程');
    }

    const coachCourse = this.coachCourseRepository.create({
      coachId: dto.coachId,
      courseId: dto.courseId,
    });
    return await this.coachCourseRepository.save(coachCourse);
  }

  async delete(id: number) {
    const coachCourse = await this.coachCourseRepository.findOne({ where: { id } });
    if (!coachCourse || coachCourse.isDeleted === 1) {
      throw new NotFoundException('教练课程关联不存在');
    }
    coachCourse.isDeleted = 1;
    coachCourse.deletedAt = new Date();
    await this.coachCourseRepository.save(coachCourse);
  }
}
```

- [ ] **Step 4: Create CoachCourse controller**

```ts
// src/gym/coach-course/coach-course.controller.ts
import { Controller, Get, Post, Delete, Body, Query, Param } from '@nestjs/common';
import { CoachCourseService } from './coach-course.service';
import { CreateCoachCourseDto } from '../dto/coach-course.dto';

@Controller('gym/coach-course')
export class CoachCourseController {
  constructor(private readonly service: CoachCourseService) {}

  @Get('page')
  async page(@Query() dto: any) {
    return await this.service.page(dto);
  }

  @Post('create')
  async create(@Body() dto: CreateCoachCourseDto) {
    return await this.service.create(dto);
  }

  @Delete('/:id')
  async delete(@Param('id') id: number) {
    await this.service.delete(id);
    return { message: '删除成功' };
  }
}
```

- [ ] **Step 5: Create CoachCourse module**

```ts
// src/gym/coach-course/coach-course.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoachCourseController } from './coach-course.controller';
import { CoachCourseService } from './coach-course.service';
import { CoachCourse } from '../entities/coach-course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CoachCourse])],
  controllers: [CoachCourseController],
  providers: [CoachCourseService],
  exports: [CoachCourseService],
})
export class CoachCourseModule {}
```

- [ ] **Step 6: Verify and commit**

```bash
cd D:/case/gym-admin/south-admin-nest
git add src/gym/entities/coach-course.entity.ts src/gym/dto/coach-course.dto.ts src/gym/coach-course/
git commit -m "feat: add coach course assignment backend module"
```

---

## Task 5: Register Coach Modules & Migrate Course Entity

**Files:**
- Modify: `src/gym/entities/course.entity.ts`
- Modify: `src/gym/gym.module.ts`
- Modify: `src/app.module.ts`

**Interfaces:**
- Consumes: All 4 new entities from Tasks 1-4
- Produces: Registered modules and entities

- [ ] **Step 1: Modify Course entity**

Replace `instructor` with `coachId` in `src/gym/entities/course.entity.ts`:

```diff
- @Column({ length: 50, nullable: true })
- instructor: string;
+ @Column({ type: 'bigint', nullable: true })
+ coachId: number;
```

- [ ] **Step 2: Update gym.module.ts**

Add imports for the 4 new modules:

```ts
// src/gym/gym.module.ts
import { Module } from '@nestjs/common';
import { CourseTypeModule } from './course-type/course-type.module';
import { LocationModule } from './location/location.module';
import { CourseModule } from './course/course.module';
import { SessionModule } from './session/session.module';
import { BookingModule } from './booking/booking.module';
import { CoachModule } from './coach/coach.module';
import { CoachScheduleTemplateModule } from './coach-schedule-template/coach-schedule-template.module';
import { CoachScheduleOverrideModule } from './coach-schedule-override/coach-schedule-override.module';
import { CoachCourseModule } from './coach-course/coach-course.module';

@Module({
  imports: [
    CourseTypeModule,
    LocationModule,
    CourseModule,
    SessionModule,
    BookingModule,
    CoachModule,
    CoachScheduleTemplateModule,
    CoachScheduleOverrideModule,
    CoachCourseModule,
  ],
  exports: [
    CourseTypeModule,
    LocationModule,
    CourseModule,
    SessionModule,
    BookingModule,
    CoachModule,
    CoachScheduleTemplateModule,
    CoachScheduleOverrideModule,
    CoachCourseModule,
  ],
})
export class GymModule {}
```

- [ ] **Step 3: Update app.module.ts**

Add 4 new entity imports and register them in the entities array:

```ts
// Add imports at top:
import { Coach } from './gym/entities/coach.entity';
import { CoachScheduleTemplate } from './gym/entities/coach-schedule-template.entity';
import { CoachScheduleOverride } from './gym/entities/coach-schedule-override.entity';
import { CoachCourse } from './gym/entities/coach-course.entity';

// In entities array:
entities: [User, Role, Permission, Menu, Article, Log, CourseType, Location, Course, CourseSession, Booking, Coach, CoachScheduleTemplate, CoachScheduleOverride, CoachCourse],
```

- [ ] **Step 4: Verify and commit**

Run: `cd D:/case/gym-admin/south-admin-nest && pnpm run build`

```bash
cd D:/case/gym-admin/south-admin-nest
git add src/gym/entities/course.entity.ts src/gym/gym.module.ts src/app.module.ts
git commit -m "feat: register coach modules and migrate course entity"
```

---

## Task 6: Frontend API Files

**Files:**
- Create: `src/servers/gym/coach.ts`
- Create: `src/servers/gym/coach-schedule-template.ts`
- Create: `src/servers/gym/coach-schedule-override.ts`
- Create: `src/servers/gym/coach-course.ts`

**Interfaces:**
- Consumes: `request` from `@/utils/request`
- Produces: API functions used by all frontend pages

- [ ] **Step 1: Create Coach API**

```ts
// src/servers/gym/coach.ts
import type { BaseFormData } from '#/form';
import type { PageServerResult, PaginationData } from '#/public';
import { request } from '@/utils/request';

enum API {
  URL = '/gym/coach',
}

export function getCoachPage(data: Partial<BaseFormData> & PaginationData) {
  return request.get<PageServerResult<BaseFormData[]>>(`${API.URL}/page`, { params: data });
}

export function getCoachList() {
  return request.get<BaseFormData[]>(`${API.URL}/list`);
}

export function getCoachById(id: string) {
  return request.get<BaseFormData>(`${API.URL}/detail?id=${id}`);
}

export function createCoach(data: BaseFormData) {
  return request.post(`${API.URL}/create`, data);
}

export function updateCoach(id: string, data: BaseFormData) {
  return request.put(`${API.URL}/update/${id}`, data);
}

export function deleteCoach(id: string) {
  return request.delete(`${API.URL}/${id}`);
}
```

- [ ] **Step 2: Create Template API**

```ts
// src/servers/gym/coach-schedule-template.ts
import type { BaseFormData } from '#/form';
import type { PageServerResult, PaginationData } from '#/public';
import { request } from '@/utils/request';

enum API {
  URL = '/gym/coach-schedule-template',
}

export function getCoachScheduleTemplatePage(data: Partial<BaseFormData> & PaginationData) {
  return request.get<PageServerResult<BaseFormData[]>>(`${API.URL}/page`, { params: data });
}

export function createCoachScheduleTemplate(data: BaseFormData) {
  return request.post(`${API.URL}/create`, data);
}

export function updateCoachScheduleTemplate(id: string, data: BaseFormData) {
  return request.put(`${API.URL}/update/${id}`, data);
}

export function deleteCoachScheduleTemplate(id: string) {
  return request.delete(`${API.URL}/${id}`);
}

export function batchGenerateSchedule(data: BaseFormData) {
  return request.post(`${API.URL}/batchGenerate`, data);
}
```

- [ ] **Step 3: Create Override API**

```ts
// src/servers/gym/coach-schedule-override.ts
import type { BaseFormData } from '#/form';
import type { PageServerResult, PaginationData } from '#/public';
import { request } from '@/utils/request';

enum API {
  URL = '/gym/coach-schedule-override',
}

export function getCoachScheduleOverridePage(data: Partial<BaseFormData> & PaginationData) {
  return request.get<PageServerResult<BaseFormData[]>>(`${API.URL}/page`, { params: data });
}

export function createCoachScheduleOverride(data: BaseFormData) {
  return request.post(`${API.URL}/create`, data);
}

export function updateCoachScheduleOverride(id: string, data: BaseFormData) {
  return request.put(`${API.URL}/update/${id}`, data);
}

export function deleteCoachScheduleOverride(id: string) {
  return request.delete(`${API.URL}/${id}`);
}
```

- [ ] **Step 4: Create CoachCourse API**

```ts
// src/servers/gym/coach-course.ts
import type { BaseFormData } from '#/form';
import type { PageServerResult, PaginationData } from '#/public';
import { request } from '@/utils/request';

enum API {
  URL = '/gym/coach-course',
}

export function getCoachCoursePage(data: Partial<BaseFormData> & PaginationData) {
  return request.get<PageServerResult<BaseFormData[]>>(`${API.URL}/page`, { params: data });
}

export function createCoachCourse(data: BaseFormData) {
  return request.post(`${API.URL}/create`, data);
}

export function deleteCoachCourse(id: string) {
  return request.delete(`${API.URL}/${id}`);
}
```

- [ ] **Step 5: Commit**

```bash
cd D:/case/gym-admin/south-admin-react
git add src/servers/gym/coach.ts src/servers/gym/coach-schedule-template.ts src/servers/gym/coach-schedule-override.ts src/servers/gym/coach-course.ts
git commit -m "feat: add coach module API files"
```

---

## Task 7: Coach Frontend Page

**Files:**
- Create: `src/pages/gym/coach/model.tsx`
- Create: `src/pages/gym/coach/index.tsx`

**Interfaces:**
- Consumes: Coach API, CoachScheduleTemplate API (for drawer)
- Produces: `/gym/coach` route

- [ ] **Step 1: Create Coach model**

```tsx
// src/pages/gym/coach/model.tsx
import type { TFunction } from 'i18next';
import type { BaseSearchList } from '#/form';
import type { TableColumn, TableOptions } from '#/public';
import { colors } from '@/utils/constants';

const COACH_STATUS = (t: TFunction): Constant[] => [
  { label: t('gym.onDuty'), value: 1, color: colors.green, type: 'tag' },
  { label: t('gym.resigned'), value: 2, color: colors.red, type: 'tag' },
];

export const searchList = (t: TFunction): BaseSearchList[] => [
  {
    label: t('public.name'),
    name: 'name',
    component: 'Input',
  },
  {
    label: t('system.state'),
    name: 'status',
    component: 'Select',
    componentProps: {
      options: COACH_STATUS(t),
      allowClear: true,
    },
  },
];

export const tableColumns = (t: TFunction, optionRender: TableOptions<object>): TableColumn[] => {
  return [
    { title: 'ID', dataIndex: 'id', width: 70 },
    { title: t('public.name'), dataIndex: 'name', width: 100 },
    { title: t('gym.phone'), dataIndex: 'phone', width: 130 },
    {
      title: t('gym.gender'),
      dataIndex: 'gender',
      width: 80,
      enum: [
        { label: t('gym.male'), value: 1, color: colors.blue, type: 'tag' },
        { label: t('gym.female'), value: 2, color: colors.magenta, type: 'tag' },
      ],
    },
    { title: t('gym.specialties'), dataIndex: 'specialties', width: 200, ellipsis: true },
    { title: t('gym.qualifications'), dataIndex: 'qualifications', width: 200, ellipsis: true },
    {
      title: t('system.state'),
      dataIndex: 'status',
      width: 80,
      enum: COACH_STATUS(t),
    },
    { title: t('public.creationTime'), dataIndex: 'createdAt', width: 170 },
    {
      title: t('public.operate'),
      dataIndex: 'operate',
      width: 200,
      fixed: 'right',
      render: (value: unknown, record: object) => optionRender(value, record),
    },
  ];
};

export const createList = (t: TFunction): BaseFormList[] => [
  {
    label: t('public.name'),
    name: 'name',
    rules: FORM_REQUIRED,
    component: 'Input',
  },
  {
    label: t('gym.phone'),
    name: 'phone',
    component: 'Input',
  },
  {
    label: t('gym.gender'),
    name: 'gender',
    component: 'Radio',
    componentProps: {
      options: [
        { label: t('gym.male'), value: 1 },
        { label: t('gym.female'), value: 2 },
      ],
    },
  },
  {
    label: t('gym.specialties'),
    name: 'specialties',
    component: 'Input',
  },
  {
    label: t('gym.qualifications'),
    name: 'qualifications',
    component: 'Input',
  },
  {
    label: t('system.state'),
    name: 'status',
    rules: FORM_REQUIRED,
    component: 'Select',
    componentProps: {
      options: COACH_STATUS(t),
    },
  },
];
```

- [ ] **Step 2: Create Coach page**

Follow the system/user page pattern (CRUD with Modal + Drawer for schedule). The page has:
- Standard CRUD (search, table, pagination, create/edit modal)
- Schedule Drawer: shows schedule templates for the selected coach

```tsx
// src/pages/gym/coach/index.tsx
import type { BaseFormData } from '#/form';
import type { PagePermission } from '#/public';
import { useEffectOnActive } from 'keepalive-for-react';
import { type FormInstance, Form, message, Drawer, Table, Button, TimePicker, Select } from 'antd';
import { useMemo, useCallback, useState } from 'react';
import { searchList, tableColumns, createList } from './model';
import {
  getCoachPage,
  getCoachById,
  createCoach,
  updateCoach,
  deleteCoach,
} from '@/servers/gym/coach';
import {
  getCoachScheduleTemplatePage,
  createCoachScheduleTemplate,
  deleteCoachScheduleTemplate,
} from '@/servers/gym/coach-schedule-template';

interface RowData {
  id: string;
  name: string;
}

function Page() {
  const { t } = useTranslation();
  const createFormRef = useRef<FormInstance>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [isFetch, setFetch] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isCreateLoading, setCreateLoading] = useState(false);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState(ADD_TITLE(t));
  const [createId, setCreateId] = useState('');
  const [createData, setCreateData] = useState<BaseFormData>({});
  const [searchData, setSearchData] = useState<BaseFormData>({});
  const [page, setPage] = useState(INIT_PAGINATION.page);
  const [pageSize, setPageSize] = useState(INIT_PAGINATION.pageSize);
  const [total, setTotal] = useState(0);
  const [tableData, setTableData] = useState<BaseFormData[]>([]);
  const [form] = Form.useForm();
  const { permissions } = useCommonStore();

  // Schedule drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerCoachId, setDrawerCoachId] = useState<number | null>(null);
  const [templateData, setTemplateData] = useState<BaseFormData[]>([]);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [isTemplateOpen, setTemplateOpen] = useState(false);
  const [templateForm] = Form.useForm();

  const permissionPrefix = '/gym/coach';
  const pagePermission: PagePermission = {
    page: checkPermission(permissionPrefix, permissions),
    create: checkPermission(`${permissionPrefix}/create`, permissions),
    update: checkPermission(`${permissionPrefix}/update`, permissions),
    delete: checkPermission(`${permissionPrefix}/delete`, permissions),
  };

  const getPage = useCallback(async () => {
    const params = { ...searchData, page, pageSize };
    try {
      setLoading(true);
      const { code, data } = await getCoachPage(params);
      if (Number(code) !== 200) return;
      const { items, total } = data;
      setTotal(total || 0);
      setTableData(items || []);
    } finally {
      setFetch(false);
      setLoading(false);
    }
  }, [page, pageSize, searchData]);

  useEffect(() => { if (isFetch) getPage(); }, [isFetch]);
  useEffect(() => { if (pagePermission.page) getPage(); }, [pagePermission.page]);
  useEffectOnActive(() => { getPage(); }, []);

  const onSearch = (values: BaseFormData) => {
    setPage(1);
    setSearchData(values);
    setFetch(true);
  };

  const onCreate = () => {
    setCreateOpen(true);
    setCreateTitle(ADD_TITLE(t));
    setCreateId('');
    setCreateData({});
  };

  const onUpdate = async (id: string) => {
    try {
      setCreateOpen(true);
      setCreateTitle(EDIT_TITLE(t, id));
      setCreateId(id);
      setCreateLoading(true);
      const { code, data } = await getCoachById(id);
      if (Number(code) !== 200) return;
      setCreateData(data);
    } finally {
      setCreateLoading(false);
    }
  };

  const createSubmit = () => { createFormRef.current?.submit(); };
  const closeCreate = () => { setCreateOpen(false); };

  const handleCreate = async (values: BaseFormData) => {
    try {
      setCreateLoading(true);
      const fn = () => (createId ? updateCoach(createId, values) : createCoach(values));
      const { code, message } = await fn();
      if (Number(code) !== 200) return;
      messageApi.success(message || t('public.successfulOperation'));
      setCreateOpen(false);
      getPage();
    } finally {
      setCreateLoading(false);
    }
  };

  const onDelete = async (id: string) => {
    try {
      setLoading(true);
      const { code, message } = await deleteCoach(id);
      if (Number(code) === 200) {
        messageApi.success(message || t('public.successfullyDeleted'));
        getPage();
      }
    } finally {
      setLoading(false);
    }
  };

  // Schedule drawer
  const onOpenSchedule = async (coachId: number) => {
    setDrawerOpen(true);
    setDrawerCoachId(coachId);
    try {
      setTemplateLoading(true);
      const { code, data } = await getCoachScheduleTemplatePage({ coachId, page: 1, pageSize: 100 });
      if (Number(code) === 200) setTemplateData(data?.items || []);
    } finally {
      setTemplateLoading(false);
    }
  };

  const templateColumns = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    { title: t('gym.dayOfWeek'), dataIndex: 'dayOfWeek', width: 100 },
    { title: t('gym.startTime'), dataIndex: 'startTime', width: 100 },
    { title: t('gym.endTime'), dataIndex: 'endTime', width: 100 },
    {
      title: t('public.operate'),
      width: 100,
      render: (_: unknown, record: any) => (
        <DeleteBtn
          name={t('gym.scheduleTemplate')}
          handleDelete={async () => {
            await deleteCoachScheduleTemplate(String(record.id));
            onOpenSchedule(drawerCoachId!);
          }}
        />
      ),
    },
  ];

  const handleAddTemplate = async (values: BaseFormData) => {
    await createCoachScheduleTemplate({ ...values, coachId: drawerCoachId });
    setTemplateOpen(false);
    templateForm.resetFields();
    onOpenSchedule(drawerCoachId!);
  };

  const onChangePagination = useCallback((page: number, pageSize: number) => {
    setPage(page);
    setPageSize(pageSize);
    setFetch(true);
  }, []);

  const optionRender = useCallback(
    (_: unknown, record: object) => (
      <div className="flex flex-wrap gap-5px">
        <Button size="small" type="link" onClick={() => onOpenSchedule((record as RowData).id as unknown as number)}>
          {t('gym.viewSchedule')}
        </Button>
        {pagePermission.update === true && (
          <UpdateBtn onClick={() => onUpdate((record as RowData).id)} />
        )}
        {pagePermission.delete === true && (
          <DeleteBtn name={(record as RowData).name} handleDelete={() => onDelete((record as RowData).id)} />
        )}
      </div>
    ),
    [pagePermission.update, pagePermission.delete, onUpdate, onDelete, t],
  );

  const columns = useMemo(() => tableColumns(t, optionRender), [t, optionRender]);

  return (
    <BaseContent isPermission={pagePermission.page}>
      {contextHolder}
      <BaseCard>
        <BaseSearch list={searchList(t)} data={searchData} isLoading={isLoading} handleFinish={onSearch} />
      </BaseCard>
      <BaseCard className="mt-10px">
        <BaseTable isLoading={isLoading} isCreate={pagePermission.create} columns={columns} dataSource={tableData} getPage={getPage} onCreate={onCreate} />
        <BasePagination disabled={isLoading} current={page} pageSize={pageSize} total={total} onChange={onChangePagination} />
      </BaseCard>
      <BaseModal title={createTitle} open={isCreateOpen} confirmLoading={isCreateLoading} onOk={createSubmit} onCancel={closeCreate}>
        <BaseForm form={form} ref={createFormRef} list={createList(t)} labelCol={{ span: 4 }} data={createData} handleFinish={handleCreate} />
      </BaseModal>
      <Drawer title={t('gym.scheduleManagement')} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={600}>
        <div className="mb-10px">
          <Button type="primary" size="small" onClick={() => setTemplateOpen(true)}>{ADD_TITLE(t)}</Button>
        </div>
        <Table columns={templateColumns} dataSource={templateData} loading={templateLoading} rowKey="id" size="small" pagination={false} />
        <BaseModal title={ADD_TITLE(t)} open={isTemplateOpen} onOk={() => templateForm.submit()} onCancel={() => setTemplateOpen(false)}>
          <BaseForm form={templateForm} list={[
            { label: t('gym.dayOfWeek'), name: 'dayOfWeek', rules: FORM_REQUIRED, component: 'Select', componentProps: { options: [
              { label: t('gym.monday'), value: 1 }, { label: t('gym.tuesday'), value: 2 },
              { label: t('gym.wednesday'), value: 3 }, { label: t('gym.thursday'), value: 4 },
              { label: t('gym.friday'), value: 5 }, { label: t('gym.saturday'), value: 6 },
              { label: t('gym.sunday'), value: 7 },
            ]}},
            { label: t('gym.startTime'), name: 'startTime', rules: FORM_REQUIRED, component: 'TimePicker', componentProps: { format: 'HH:mm', style: { width: '100%' } } },
            { label: t('gym.endTime'), name: 'endTime', rules: FORM_REQUIRED, component: 'TimePicker', componentProps: { format: 'HH:mm', style: { width: '100%' } } },
          ]} handleFinish={handleAddTemplate} />
        </BaseModal>
      </Drawer>
    </BaseContent>
  );
}

export default Page;
```

- [ ] **Step 3: Commit**

```bash
cd D:/case/gym-admin/south-admin-react
git add src/pages/gym/coach/
git commit -m "feat: add coach management page with schedule drawer"
```

---

## Task 8: Coach Schedule Template Frontend Page

**Files:**
- Create: `src/pages/gym/coach-schedule-template/model.tsx`
- Create: `src/pages/gym/coach-schedule-template/index.tsx`

**Interfaces:**
- Consumes: Template API, Coach API (for ApiSelect)
- Produces: `/gym/coach-schedule-template` route

- [ ] **Step 1: Create Template model and page**

Follow the standard CRUD page pattern with:
- Search: Coach ApiSelect + Day of Week Select
- Table: Coach name, day of week, start time, end time
- Create/Edit Modal: Coach ApiSelect, Day Select, TimePickers
- Batch Generate button with date range picker

```tsx
// src/pages/gym/coach-schedule-template/model.tsx
import type { TFunction } from 'i18next';
import type { BaseSearchList } from '#/form';
import type { TableColumn, TableOptions } from '#/public';
import { getCoachList } from '@/servers/gym/coach';

const DAY_OPTIONS = (t: TFunction) => [
  { label: t('gym.monday'), value: 1 },
  { label: t('gym.tuesday'), value: 2 },
  { label: t('gym.wednesday'), value: 3 },
  { label: t('gym.thursday'), value: 4 },
  { label: t('gym.friday'), value: 5 },
  { label: t('gym.saturday'), value: 6 },
  { label: t('gym.sunday'), value: 7 },
];

export const searchList = (t: TFunction): BaseSearchList[] => [
  {
    label: t('gym.coach'),
    name: 'coachId',
    component: 'ApiSelect',
    componentProps: {
      api: getCoachList as ApiFn,
      fieldNames: { label: 'name', value: 'id' },
      allowClear: true,
    },
  },
  {
    label: t('gym.dayOfWeek'),
    name: 'dayOfWeek',
    component: 'Select',
    componentProps: { options: DAY_OPTIONS(t), allowClear: true },
  },
];

export const tableColumns = (t: TFunction, optionRender: TableOptions<object>): TableColumn[] => [
  { title: 'ID', dataIndex: 'id', width: 70 },
  { title: t('gym.coachId'), dataIndex: 'coachId', width: 100 },
  { title: t('gym.dayOfWeek'), dataIndex: 'dayOfWeek', width: 100 },
  { title: t('gym.startTime'), dataIndex: 'startTime', width: 100 },
  { title: t('gym.endTime'), dataIndex: 'endTime', width: 100 },
  { title: t('public.operate'), dataIndex: 'operate', width: 150, fixed: 'right', render: (v, r) => optionRender(v, r) },
];

export const createList = (t: TFunction): BaseFormList[] => [
  {
    label: t('gym.coach'),
    name: 'coachId',
    rules: FORM_REQUIRED,
    component: 'ApiSelect',
    componentProps: { api: getCoachList as ApiFn, fieldNames: { label: 'name', value: 'id' } },
  },
  {
    label: t('gym.dayOfWeek'),
    name: 'dayOfWeek',
    rules: FORM_REQUIRED,
    component: 'Select',
    componentProps: { options: DAY_OPTIONS(t) },
  },
  {
    label: t('gym.startTime'),
    name: 'startTime',
    rules: FORM_REQUIRED,
    component: 'TimePicker',
    componentProps: { format: 'HH:mm', style: { width: '100%' } },
  },
  {
    label: t('gym.endTime'),
    name: 'endTime',
    rules: FORM_REQUIRED,
    component: 'TimePicker',
    componentProps: { format: 'HH:mm', style: { width: '100%' } },
  },
];
```

The page component follows the standard CRUD pattern (same as CourseType page). Add a "批量生成" button that opens a modal with startDate/endDate RangePicker.

- [ ] **Step 2: Commit**

```bash
cd D:/case/gym-admin/south-admin-react
git add src/pages/gym/coach-schedule-template/
git commit -m "feat: add coach schedule template page"
```

---

## Task 9: Coach Schedule Override Frontend Page

**Files:**
- Create: `src/pages/gym/coach-schedule-override/model.tsx`
- Create: `src/pages/gym/coach-schedule-override/index.tsx`

**Interfaces:**
- Consumes: Override API, Coach API
- Produces: `/gym/coach-schedule-override` route

- [ ] **Step 1: Create Override model and page**

Standard CRUD page. The create form has conditional fields: startTime/endTime only show when type is 2 (加班) or 3 (换班).

```tsx
// src/pages/gym/coach-schedule-override/model.tsx
import type { TFunction } from 'i18next';
import type { BaseSearchList } from '#/form';
import type { TableColumn, TableOptions } from '#/public';
import { colors } from '@/utils/constants';
import { getCoachList } from '@/servers/gym/coach';

const OVERRIDE_TYPE = (t: TFunction): Constant[] => [
  { label: t('gym.leave'), value: 1, color: colors.red, type: 'tag' },
  { label: t('gym.overtime'), value: 2, color: colors.green, type: 'tag' },
  { label: t('gym.shiftChange'), value: 3, color: colors.orange, type: 'tag' },
];

export const searchList = (t: TFunction): BaseSearchList[] => [
  {
    label: t('gym.coach'),
    name: 'coachId',
    component: 'ApiSelect',
    componentProps: {
      api: getCoachList as ApiFn,
      fieldNames: { label: 'name', value: 'id' },
      allowClear: true,
    },
  },
  {
    label: t('gym.overrideType'),
    name: 'type',
    component: 'Select',
    componentProps: { options: OVERRIDE_TYPE(t), allowClear: true },
  },
];

export const tableColumns = (t: TFunction, optionRender: TableOptions<object>): TableColumn[] => [
  { title: 'ID', dataIndex: 'id', width: 70 },
  { title: t('gym.coachId'), dataIndex: 'coachId', width: 100 },
  { title: t('gym.overrideDate'), dataIndex: 'overrideDate', width: 120 },
  { title: t('gym.overrideType'), dataIndex: 'type', width: 100, enum: OVERRIDE_TYPE(t) },
  { title: t('gym.startTime'), dataIndex: 'startTime', width: 100 },
  { title: t('gym.endTime'), dataIndex: 'endTime', width: 100 },
  { title: t('gym.reason'), dataIndex: 'reason', width: 200, ellipsis: true },
  { title: t('public.operate'), dataIndex: 'operate', width: 150, fixed: 'right', render: (v, r) => optionRender(v, r) },
];

export const createList = (t: TFunction): BaseFormList[] => [
  {
    label: t('gym.coach'),
    name: 'coachId',
    rules: FORM_REQUIRED,
    component: 'ApiSelect',
    componentProps: { api: getCoachList as ApiFn, fieldNames: { label: 'name', value: 'id' } },
  },
  {
    label: t('gym.overrideDate'),
    name: 'overrideDate',
    rules: FORM_REQUIRED,
    component: 'DatePicker',
    componentProps: { style: { width: '100%' } },
  },
  {
    label: t('gym.overrideType'),
    name: 'type',
    rules: FORM_REQUIRED,
    component: 'Select',
    componentProps: { options: OVERRIDE_TYPE(t) },
  },
  {
    label: t('gym.startTime'),
    name: 'startTime',
    component: 'TimePicker',
    componentProps: { format: 'HH:mm', style: { width: '100%' } },
  },
  {
    label: t('gym.endTime'),
    name: 'endTime',
    component: 'TimePicker',
    componentProps: { format: 'HH:mm', style: { width: '100%' } },
  },
  {
    label: t('gym.reason'),
    name: 'reason',
    component: 'Input',
  },
];
```

- [ ] **Step 2: Commit**

```bash
cd D:/case/gym-admin/south-admin-react
git add src/pages/gym/coach-schedule-override/
git commit -m "feat: add coach schedule override page"
```

---

## Task 10: Coach Course Assignment Frontend Page

**Files:**
- Create: `src/pages/gym/coach-course/model.ts`
- Create: `src/pages/gym/coach-course/index.tsx`

**Interfaces:**
- Consumes: CoachCourse API, Coach API, Course API
- Produces: `/gym/coach-course` route

- [ ] **Step 1: Create CoachCourse model and page**

Simple CRUD page — only create (assign) and delete (unassign). No update.

- [ ] **Step 2: Commit**

```bash
cd D:/case/gym-admin/south-admin-react
git add src/pages/gym/coach-course/
git commit -m "feat: add coach course assignment page"
```

---

## Task 11: i18n Translations

**Files:**
- Modify/Create: `src/locales/zh/gym.ts`
- Modify/Create: `src/locales/en/gym.ts`

- [ ] **Step 1: Add coach-related translation keys**

Add to both locale files: coach, phone, gender, male, female, specialties, qualifications, onDuty, resigned, scheduleTemplate, scheduleManagement, viewSchedule, dayOfWeek, monday, tuesday, wednesday, thursday, friday, saturday, sunday, startTime, endTime, overrideDate, overrideType, leave, overtime, shiftChange, reason, batchGenerate, coachCourse, assignCourse.

- [ ] **Step 2: Commit**

```bash
cd D:/case/gym-admin/south-admin-react
git add src/locales/
git commit -m "feat: add i18n translations for coach module"
```

---

## Task 12: Menu & Permission Seed Data

**Files:**
- Modify: `init.sql` in backend

- [ ] **Step 1: Add SQL seed data**

Add 4 menu entries + 16 permission entries for coach module pages. Follow existing patterns from the gym module seed data.

- [ ] **Step 2: Commit**

```bash
cd D:/case/gym-admin/south-admin-nest
git add init.sql
git commit -m "feat: add coach module menu and permission seed data"
```

---

## Verification Checklist

1. **Backend**: `pnpm run build` passes with 0 errors
2. **Coach CRUD**: Create, list, edit, delete coach via API
3. **Template CRUD**: Create template, verify conflict detection
4. **Batch Generate**: Generate schedule from template for date range
5. **Override CRUD**: Create override (leave/overtime/shift change)
6. **CoachCourse**: Assign coach to course, verify duplicate detection
7. **Course Migration**: Verify course entity has coachId instead of instructor
8. **Frontend**: All 4 pages render, search/filter works, modals submit
9. **Schedule Drawer**: Opens from coach page, shows templates, can add/delete
10. **Menu**: Navigation appears and routes work
