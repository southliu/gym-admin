# 课程预约模块 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a course booking module for a gym admin system with course management (CRUD + recurring sessions) and booking management (create/cancel with conflict detection).

**Architecture:** Session-based model — Course is a template, CourseSession is a concrete timeslot, Booking links User to Session. Backend: NestJS + TypeORM + MySQL. Frontend: React + Ant Design + config-driven forms. All patterns follow existing project conventions (Article module for backend, system/user page for frontend).

**Tech Stack:** NestJS 10, TypeORM 0.3, MySQL, React 19, Ant Design 5, Zustand, TypeScript, pnpm workspaces

## Global Constraints

- All backend entities extend `BaseEntity` from `src/common/entities/base.entity.ts`
- Soft-delete pattern: set `isDeleted = 1` and `deletedAt = new Date()`, never hard-delete
- API routes follow verb-style: `/page`, `/list`, `/detail?id=`, `/create`, `/update/:id`, `/:id` (DELETE)
- Response automatically wrapped by `ResponseInterceptor` — return raw data, not `ApiResponse`
- Frontend uses auto-imports (no explicit React/BaseComponent imports needed)
- Frontend forms use `BaseFormList[]` schema with `component` string mapping
- Permission prefix pattern: `/gym/course-type`, `/gym/location`, etc.
- No test infrastructure — verify by running dev servers and manual testing

---

## File Structure

### Backend files (all under `D:\case\gym-admin\south-admin-nest\src\`)

| File | Responsibility |
|------|---------------|
| `gym/entities/course-type.entity.ts` | CourseType entity |
| `gym/entities/location.entity.ts` | Location entity |
| `gym/entities/course.entity.ts` | Course entity |
| `gym/entities/course-session.entity.ts` | CourseSession entity |
| `gym/entities/booking.entity.ts` | Booking entity |
| `gym/dto/course-type.dto.ts` | Create/Update DTOs for CourseType |
| `gym/dto/location.dto.ts` | Create/Update DTOs for Location |
| `gym/dto/course.dto.ts` | Create/Update DTOs for Course |
| `gym/dto/session.dto.ts` | Update DTOs for Session |
| `gym/dto/booking.dto.ts` | Create DTO for Booking |
| `gym/course-type/course-type.module.ts` | CourseType NestJS module |
| `gym/course-type/course-type.controller.ts` | CourseType controller |
| `gym/course-type/course-type.service.ts` | CourseType service |
| `gym/location/location.module.ts` | Location NestJS module |
| `gym/location/location.controller.ts` | Location controller |
| `gym/location/location.service.ts` | Location service |
| `gym/course/course.module.ts` | Course NestJS module |
| `gym/course/course.controller.ts` | Course controller |
| `gym/course/course.service.ts` | Course service (with session generation) |
| `gym/session/session.module.ts` | Session NestJS module |
| `gym/session/session.controller.ts` | Session controller |
| `gym/session/session.service.ts` | Session service |
| `gym/booking/booking.module.ts` | Booking NestJS module |
| `gym/booking/booking.controller.ts` | Booking controller |
| `gym/booking/booking.service.ts` | Booking service (with conflict detection) |
| `gym/gym.module.ts` | Aggregator module |

### Frontend files (all under `D:\case\gym-admin\south-admin-react\src\`)

| File | Responsibility |
|------|---------------|
| `servers/gym/course-type.ts` | CourseType API calls |
| `servers/gym/location.ts` | Location API calls |
| `servers/gym/course.ts` | Course API calls |
| `servers/gym/session.ts` | Session API calls |
| `servers/gym/booking.ts` | Booking API calls |
| `pages/gym/course-type/model.ts` | CourseType search/table/form config |
| `pages/gym/course-type/index.tsx` | CourseType CRUD page |
| `pages/gym/location/model.ts` | Location search/table/form config |
| `pages/gym/location/index.tsx` | Location CRUD page |
| `pages/gym/course/model.tsx` | Course search/table/form config |
| `pages/gym/course/index.tsx` | Course page with session drawer |
| `pages/gym/booking/model.ts` | Booking search/table/form config |
| `pages/gym/booking/index.tsx` | Booking page with cascading selects |

---

## Task 1: CourseType Backend

**Files:**
- Create: `src/gym/entities/course-type.entity.ts`
- Create: `src/gym/dto/course-type.dto.ts`
- Create: `src/gym/course-type/course-type.module.ts`
- Create: `src/gym/course-type/course-type.controller.ts`
- Create: `src/gym/course-type/course-type.service.ts`

**Interfaces:**
- Consumes: `BaseEntity` from `src/common/entities/base.entity.ts`, `PaginationDto` from `src/common/dto/pagination.dto.ts`
- Produces: `CourseType` entity, `CourseTypeService` (exported for use by Course module)

- [ ] **Step 1: Create CourseType entity**

```ts
// src/gym/entities/course-type.entity.ts
import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('gym_course_type')
export class CourseType extends BaseEntity {
  @Column({ length: 50 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 0 })
  order: number;
}
```

- [ ] **Step 2: Create CourseType DTOs**

```ts
// src/gym/dto/course-type.dto.ts
import { IsString, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCourseTypeDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  order?: number;
}

export class UpdateCourseTypeDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  order?: number;
}
```

- [ ] **Step 3: Create CourseType service**

```ts
// src/gym/course-type/course-type.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseType } from '../entities/course-type.entity';
import { CreateCourseTypeDto, UpdateCourseTypeDto } from '../dto/course-type.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class CourseTypeService {
  constructor(
    @InjectRepository(CourseType)
    private courseTypeRepository: Repository<CourseType>,
  ) {}

  async page(dto: PaginationDto & { name?: string }) {
    const { page = 1, pageSize = 10, name } = dto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.courseTypeRepository
      .createQueryBuilder('courseType')
      .where('courseType.isDeleted = :isDeleted', { isDeleted: 0 });

    if (name) {
      queryBuilder.andWhere('courseType.name LIKE :name', {
        name: `%${name}%`,
      });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .orderBy('courseType.order', 'ASC')
      .addOrderBy('courseType.createdAt', 'DESC')
      .getManyAndCount();

    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }

  async detail(id: number) {
    const courseType = await this.courseTypeRepository.findOne({ where: { id } });
    if (!courseType || courseType.isDeleted === 1) {
      throw new NotFoundException('课程类型不存在');
    }
    return courseType;
  }

  async create(dto: CreateCourseTypeDto) {
    const courseType = this.courseTypeRepository.create({
      name: dto.name,
      description: dto.description,
      order: dto.order ?? 0,
    });
    return await this.courseTypeRepository.save(courseType);
  }

  async update(id: number, dto: UpdateCourseTypeDto) {
    const courseType = await this.courseTypeRepository.findOne({ where: { id } });
    if (!courseType || courseType.isDeleted === 1) {
      throw new NotFoundException('课程类型不存在');
    }
    courseType.name = dto.name;
    courseType.description = dto.description;
    courseType.order = dto.order ?? courseType.order;
    return await this.courseTypeRepository.save(courseType);
  }

  async delete(id: number) {
    const courseType = await this.courseTypeRepository.findOne({ where: { id } });
    if (!courseType || courseType.isDeleted === 1) {
      throw new NotFoundException('课程类型不存在');
    }
    courseType.isDeleted = 1;
    courseType.deletedAt = new Date();
    await this.courseTypeRepository.save(courseType);
  }

  async list() {
    return await this.courseTypeRepository.find({
      where: { isDeleted: 0 },
      select: ['id', 'name'],
      order: { order: 'ASC' },
    });
  }
}
```

- [ ] **Step 4: Create CourseType controller**

```ts
// src/gym/course-type/course-type.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Query, Param } from '@nestjs/common';
import { CourseTypeService } from './course-type.service';
import { CreateCourseTypeDto, UpdateCourseTypeDto } from '../dto/course-type.dto';

@Controller('gym/course-type')
export class CourseTypeController {
  constructor(private readonly courseTypeService: CourseTypeService) {}

  @Get('page')
  async page(@Query() dto: any) {
    return await this.courseTypeService.page(dto);
  }

  @Get('list')
  async list() {
    return await this.courseTypeService.list();
  }

  @Get('detail')
  async detail(@Query('id') id: number) {
    return await this.courseTypeService.detail(id);
  }

  @Post('create')
  async create(@Body() dto: CreateCourseTypeDto) {
    return await this.courseTypeService.create(dto);
  }

  @Put('update/:id')
  async update(@Param('id') id: number, @Body() dto: UpdateCourseTypeDto) {
    return await this.courseTypeService.update(id, dto);
  }

  @Delete('/:id')
  async delete(@Param('id') id: number) {
    await this.courseTypeService.delete(id);
    return { message: '删除成功' };
  }
}
```

- [ ] **Step 5: Create CourseType module**

```ts
// src/gym/course-type/course-type.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseTypeController } from './course-type.controller';
import { CourseTypeService } from './course-type.service';
import { CourseType } from '../entities/course-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseType])],
  controllers: [CourseTypeController],
  providers: [CourseTypeService],
  exports: [CourseTypeService],
})
export class CourseTypeModule {}
```

- [ ] **Step 6: Verify — start backend, test endpoints**

Run in `D:\case\gym-admin\south-admin-nest`:
```bash
pnpm run start:dev
```
Use curl or Postman to verify:
- `POST /gym/course-type/create` with `{"name": "瑜伽", "order": 1}`
- `GET /gym/course-type/page?page=1&pageSize=10`
- `GET /gym/course-type/list`

- [ ] **Step 7: Commit**

```bash
cd D:/case/gym-admin/south-admin-nest
git add src/gym/
git commit -m "feat: add course type backend module"
```

---

## Task 2: Location Backend

**Files:**
- Create: `src/gym/entities/location.entity.ts`
- Create: `src/gym/dto/location.dto.ts`
- Create: `src/gym/location/location.module.ts`
- Create: `src/gym/location/location.controller.ts`
- Create: `src/gym/location/location.service.ts`

**Interfaces:**
- Consumes: `BaseEntity`, `PaginationDto`
- Produces: `Location` entity, `LocationService` (exported for Course module)

- [ ] **Step 1: Create Location entity**

```ts
// src/gym/entities/location.entity.ts
import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('gym_location')
export class Location extends BaseEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ length: 255, nullable: true })
  address: string;

  @Column({ type: 'int', nullable: true })
  capacity: number;
}
```

- [ ] **Step 2: Create Location DTOs**

```ts
// src/gym/dto/location.dto.ts
import { IsString, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLocationDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  capacity?: number;
}

export class UpdateLocationDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  capacity?: number;
}
```

- [ ] **Step 3: Create Location service**

```ts
// src/gym/location/location.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from '../entities/location.entity';
import { CreateLocationDto, UpdateLocationDto } from '../dto/location.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
  ) {}

  async page(dto: PaginationDto & { name?: string }) {
    const { page = 1, pageSize = 10, name } = dto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.locationRepository
      .createQueryBuilder('location')
      .where('location.isDeleted = :isDeleted', { isDeleted: 0 });

    if (name) {
      queryBuilder.andWhere('location.name LIKE :name', {
        name: `%${name}%`,
      });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .orderBy('location.createdAt', 'DESC')
      .getManyAndCount();

    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }

  async detail(id: number) {
    const location = await this.locationRepository.findOne({ where: { id } });
    if (!location || location.isDeleted === 1) {
      throw new NotFoundException('地点不存在');
    }
    return location;
  }

  async create(dto: CreateLocationDto) {
    const location = this.locationRepository.create({
      name: dto.name,
      address: dto.address,
      capacity: dto.capacity,
    });
    return await this.locationRepository.save(location);
  }

  async update(id: number, dto: UpdateLocationDto) {
    const location = await this.locationRepository.findOne({ where: { id } });
    if (!location || location.isDeleted === 1) {
      throw new NotFoundException('地点不存在');
    }
    location.name = dto.name;
    location.address = dto.address;
    location.capacity = dto.capacity;
    return await this.locationRepository.save(location);
  }

  async delete(id: number) {
    const location = await this.locationRepository.findOne({ where: { id } });
    if (!location || location.isDeleted === 1) {
      throw new NotFoundException('地点不存在');
    }
    location.isDeleted = 1;
    location.deletedAt = new Date();
    await this.locationRepository.save(location);
  }

  async list() {
    return await this.locationRepository.find({
      where: { isDeleted: 0 },
      select: ['id', 'name', 'capacity'],
    });
  }
}
```

- [ ] **Step 4: Create Location controller**

```ts
// src/gym/location/location.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Query, Param } from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto, UpdateLocationDto } from '../dto/location.dto';

@Controller('gym/location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('page')
  async page(@Query() dto: any) {
    return await this.locationService.page(dto);
  }

  @Get('list')
  async list() {
    return await this.locationService.list();
  }

  @Get('detail')
  async detail(@Query('id') id: number) {
    return await this.locationService.detail(id);
  }

  @Post('create')
  async create(@Body() dto: CreateLocationDto) {
    return await this.locationService.create(dto);
  }

  @Put('update/:id')
  async update(@Param('id') id: number, @Body() dto: UpdateLocationDto) {
    return await this.locationService.update(id, dto);
  }

  @Delete('/:id')
  async delete(@Param('id') id: number) {
    await this.locationService.delete(id);
    return { message: '删除成功' };
  }
}
```

- [ ] **Step 5: Create Location module**

```ts
// src/gym/location/location.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { Location } from '../entities/location.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Location])],
  controllers: [LocationController],
  providers: [LocationService],
  exports: [LocationService],
})
export class LocationModule {}
```

- [ ] **Step 6: Verify**

Run backend and test:
- `POST /gym/location/create` with `{"name": "1号操房", "address": "B1层", "capacity": 50}`
- `GET /gym/location/page?page=1&pageSize=10`
- `GET /gym/location/list`

- [ ] **Step 7: Commit**

```bash
cd D:/case/gym-admin/south-admin-nest
git add src/gym/entities/location.entity.ts src/gym/dto/location.dto.ts src/gym/location/
git commit -m "feat: add location backend module"
```

---

## Task 3: Course Backend

**Files:**
- Create: `src/gym/entities/course.entity.ts`
- Create: `src/gym/dto/course.dto.ts`
- Create: `src/gym/course/course.module.ts`
- Create: `src/gym/course/course.controller.ts`
- Create: `src/gym/course/course.service.ts`

**Interfaces:**
- Consumes: `BaseEntity`, `PaginationDto`, `CourseTypeService`, `LocationService`
- Produces: `Course` entity, `CourseService` (exported for Booking module)
- Depends on: `CourseTypeModule`, `LocationModule`

- [ ] **Step 1: Create Course entity**

```ts
// src/gym/entities/course.entity.ts
import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('gym_course')
export class Course extends BaseEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ type: 'bigint' })
  typeId: number;

  @Column({ type: 'bigint' })
  locationId: number;

  @Column({ length: 50, nullable: true })
  instructor: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ type: 'int', default: 1, comment: '1=开放预约 2=已满 3=已取消 4=已结束' })
  status: number;

  @Column({ type: 'boolean', default: false })
  isRecurring: boolean;

  @Column({ type: 'simple-json', nullable: true })
  repeatRule: { freq: string; days: number[]; interval: number; endDate: string } | null;

  @Column({ type: 'datetime', nullable: true })
  startDate: Date;

  @Column({ length: 50, nullable: true })
  createdUser: string;

  @Column({ length: 50, nullable: true })
  updatedUser: string;
}
```

- [ ] **Step 2: Create Course DTOs**

```ts
// src/gym/dto/course.dto.ts
import { IsString, IsOptional, IsInt, IsBoolean, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCourseDto {
  @IsString()
  name: string;

  @Type(() => Number)
  @IsInt()
  typeId: number;

  @Type(() => Number)
  @IsInt()
  locationId: number;

  @IsOptional()
  @IsString()
  instructor?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsInt()
  capacity: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  repeatRule?: { freq: string; days: number[]; interval: number; endDate: string };

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsString()
  createdUser?: string;
}

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  typeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  locationId?: number;

  @IsOptional()
  @IsString()
  instructor?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  capacity?: number;

  @IsOptional()
  @IsString()
  updatedUser?: string;
}
```

- [ ] **Step 3: Create Course service**

```ts
// src/gym/course/course.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Course } from '../entities/course.entity';
import { CourseSession } from '../entities/course-session.entity';
import { Booking } from '../entities/booking.entity';
import { CreateCourseDto, UpdateCourseDto } from '../dto/course.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(CourseSession)
    private sessionRepository: Repository<CourseSession>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  async page(dto: PaginationDto & { name?: string; typeId?: number; status?: number }) {
    const { page = 1, pageSize = 10, name, typeId, status } = dto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('courseType', 'ct', 'ct.id = course.typeId AND ct.isDeleted = 0')
      .leftJoinAndSelect('courseLocation', 'cl', 'cl.id = course.locationId AND cl.isDeleted = 0')
      .where('course.isDeleted = :isDeleted', { isDeleted: 0 });

    if (name) {
      queryBuilder.andWhere('course.name LIKE :name', { name: `%${name}%` });
    }
    if (typeId) {
      queryBuilder.andWhere('course.typeId = :typeId', { typeId });
    }
    if (status !== undefined) {
      queryBuilder.andWhere('course.status = :status', { status });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .orderBy('course.createdAt', 'DESC')
      .getManyAndCount();

    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }

  async detail(id: number) {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course || course.isDeleted === 1) {
      throw new NotFoundException('课程不存在');
    }

    const sessions = await this.sessionRepository.find({
      where: { courseId: id, isDeleted: 0 },
      order: { sessionDate: 'ASC', startTime: 'ASC' },
    });

    const totalBookings = await this.bookingRepository.count({
      where: {
        sessionId: In(sessions.map((s) => s.id)),
        status: 1,
        isDeleted: 0,
      },
    });

    return { ...course, sessions, totalBookings };
  }

  async create(dto: CreateCourseDto) {
    const course = this.courseRepository.create({
      name: dto.name,
      typeId: dto.typeId,
      locationId: dto.locationId,
      instructor: dto.instructor,
      description: dto.description,
      capacity: dto.capacity,
      status: dto.status ?? 1,
      isRecurring: dto.isRecurring ?? false,
      repeatRule: dto.repeatRule ?? null,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      createdUser: dto.createdUser,
    });

    const savedCourse = await this.courseRepository.save(course);

    // Generate sessions
    if (dto.isRecurring && dto.repeatRule) {
      await this.generateRecurringSessions(savedCourse, dto);
    } else if (dto.startDate) {
      await this.generateSingleSession(savedCourse, dto);
    }

    return savedCourse;
  }

  async update(id: number, dto: UpdateCourseDto) {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course || course.isDeleted === 1) {
      throw new NotFoundException('课程不存在');
    }

    if (dto.name !== undefined) course.name = dto.name;
    if (dto.typeId !== undefined) course.typeId = dto.typeId;
    if (dto.locationId !== undefined) course.locationId = dto.locationId;
    if (dto.instructor !== undefined) course.instructor = dto.instructor;
    if (dto.description !== undefined) course.description = dto.description;
    if (dto.capacity !== undefined) course.capacity = dto.capacity;
    if (dto.updatedUser !== undefined) course.updatedUser = dto.updatedUser;

    return await this.courseRepository.save(course);
  }

  async updateStatus(id: number, status: number) {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course || course.isDeleted === 1) {
      throw new NotFoundException('课程不存在');
    }
    course.status = status;
    return await this.courseRepository.save(course);
  }

  async delete(id: number) {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course || course.isDeleted === 1) {
      throw new NotFoundException('课程不存在');
    }

    // Soft delete course
    course.isDeleted = 1;
    course.deletedAt = new Date();
    await this.courseRepository.save(course);

    // Cancel all sessions and their bookings
    const sessions = await this.sessionRepository.find({
      where: { courseId: id, isDeleted: 0 },
    });
    for (const session of sessions) {
      session.isDeleted = 1;
      session.deletedAt = new Date();
      session.status = 3; // cancelled
      await this.sessionRepository.save(session);

      const bookings = await this.bookingRepository.find({
        where: { sessionId: session.id, status: 1, isDeleted: 0 },
      });
      for (const booking of bookings) {
        booking.status = 2; // cancelled
        await this.bookingRepository.save(booking);
      }
    }
  }

  async stats() {
    const totalCourses = await this.courseRepository.count({ where: { isDeleted: 0 } });
    const totalBookings = await this.bookingRepository.count({ where: { isDeleted: 0, status: 1 } });

    const topCourses = await this.sessionRepository
      .createQueryBuilder('session')
      .innerJoin('session', 's', 's.id = session.id')
      .select('session.courseId', 'courseId')
      .addSelect('COUNT(booking.id)', 'bookingCount')
      .leftJoin('gym_booking', 'booking', 'booking.sessionId = session.id AND booking.status = 1 AND booking.isDeleted = 0')
      .where('session.isDeleted = :isDeleted', { isDeleted: 0 })
      .groupBy('session.courseId')
      .orderBy('bookingCount', 'DESC')
      .limit(5)
      .getRawMany();

    return { totalCourses, totalBookings, topCourses };
  }

  private async generateSingleSession(course: Course, dto: CreateCourseDto) {
    const startDate = new Date(dto.startDate);
    const startTime = dto.startTime || '09:00:00';
    const endTime = dto.endTime || '10:00:00';

    const session = this.sessionRepository.create({
      courseId: course.id,
      sessionDate: startDate,
      startTime,
      endTime,
      capacity: course.capacity,
      bookedCount: 0,
      status: 1,
    });
    await this.sessionRepository.save(session);
  }

  private async generateRecurringSessions(course: Course, dto: CreateCourseDto) {
    const { repeatRule, startDate, startTime = '09:00:00', endTime = '10:00:00' } = dto;
    if (!repeatRule || !startDate) {
      throw new BadRequestException('周期课程需要提供重复规则和开始日期');
    }

    const { days, interval = 1, endDate } = repeatRule;
    if (!days || !days.length || !endDate) {
      throw new BadRequestException('重复规则需要提供星期几和结束日期');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const sessions: CourseSession[] = [];

    // Generate session dates
    const current = new Date(start);
    let weekOffset = 0;

    while (current <= end) {
      for (const day of days) {
        // day: 1=Mon .. 7=Sun
        const targetDay = day === 7 ? 0 : day; // JS: 0=Sun
        const sessionDate = new Date(start);
        sessionDate.setDate(start.getDate() + weekOffset * 7 * interval + ((targetDay - start.getDay() + 7) % 7));

        if (sessionDate >= start && sessionDate <= end) {
          const session = this.sessionRepository.create({
            courseId: course.id,
            sessionDate,
            startTime,
            endTime,
            capacity: course.capacity,
            bookedCount: 0,
            status: 1,
          });
          sessions.push(session);
        }
      }
      weekOffset++;
    }

    if (sessions.length === 0) {
      throw new BadRequestException('重复规则未匹配到任何日期');
    }

    await this.sessionRepository.save(sessions);
  }
}
```

- [ ] **Step 4: Create Course controller**

```ts
// src/gym/course/course.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Query, Param } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto, UpdateCourseDto } from '../dto/course.dto';

@Controller('gym/course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get('page')
  async page(@Query() dto: any) {
    return await this.courseService.page(dto);
  }

  @Get('detail')
  async detail(@Query('id') id: number) {
    return await this.courseService.detail(id);
  }

  @Get('stats')
  async stats() {
    return await this.courseService.stats();
  }

  @Post('create')
  async create(@Body() dto: CreateCourseDto) {
    return await this.courseService.create(dto);
  }

  @Put('update/:id')
  async update(@Param('id') id: number, @Body() dto: UpdateCourseDto) {
    return await this.courseService.update(id, dto);
  }

  @Put('updateStatus/:id')
  async updateStatus(@Param('id') id: number, @Body('status') status: number) {
    return await this.courseService.updateStatus(id, status);
  }

  @Delete('/:id')
  async delete(@Param('id') id: number) {
    await this.courseService.delete(id);
    return { message: '删除成功' };
  }
}
```

- [ ] **Step 5: Create Course module**

```ts
// src/gym/course/course.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { Course } from '../entities/course.entity';
import { CourseSession } from '../entities/course-session.entity';
import { Booking } from '../entities/booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, CourseSession, Booking])],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService],
})
export class CourseModule {}
```

- [ ] **Step 6: Verify**

Test course creation:
- `POST /gym/course/create` with:
```json
{
  "name": "晨间瑜伽",
  "typeId": 1,
  "locationId": 1,
  "instructor": "张教练",
  "capacity": 20,
  "isRecurring": true,
  "repeatRule": { "freq": "weekly", "days": [1, 3, 5], "interval": 1, "endDate": "2026-08-01" },
  "startDate": "2026-06-29",
  "startTime": "09:00:00",
  "endTime": "10:00:00"
}
```
- `GET /gym/course/detail?id=1` — should return course with sessions array

- [ ] **Step 7: Commit**

```bash
cd D:/case/gym-admin/south-admin-nest
git add src/gym/entities/course.entity.ts src/gym/dto/course.dto.ts src/gym/course/
git commit -m "feat: add course backend module with session generation"
```

---

## Task 4: CourseSession Backend

**Files:**
- Create: `src/gym/entities/course-session.entity.ts`
- Create: `src/gym/dto/session.dto.ts`
- Create: `src/gym/session/session.module.ts`
- Create: `src/gym/session/session.controller.ts`
- Create: `src/gym/session/session.service.ts`

**Interfaces:**
- Consumes: `BaseEntity`, `PaginationDto`, `Booking` entity
- Produces: `CourseSession` entity, `SessionService`

- [ ] **Step 1: Create CourseSession entity**

```ts
// src/gym/entities/course-session.entity.ts
import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('gym_course_session')
export class CourseSession extends BaseEntity {
  @Column({ type: 'bigint' })
  courseId: number;

  @Column({ type: 'date' })
  sessionDate: Date;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ type: 'int', default: 0 })
  bookedCount: number;

  @Column({ type: 'int', default: 1, comment: '1=开放 2=已满 3=已取消 4=已结束' })
  status: number;
}
```

- [ ] **Step 2: Create Session DTOs**

```ts
// src/gym/dto/session.dto.ts
import { IsOptional, IsInt, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSessionDto {
  @IsOptional()
  @IsDateString()
  sessionDate?: string;

  @IsOptional()
  startTime?: string;

  @IsOptional()
  endTime?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  capacity?: number;
}
```

- [ ] **Step 3: Create Session service**

```ts
// src/gym/session/session.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseSession } from '../entities/course-session.entity';
import { Booking } from '../entities/booking.entity';
import { UpdateSessionDto } from '../dto/session.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(CourseSession)
    private sessionRepository: Repository<CourseSession>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  async page(dto: PaginationDto & { courseId?: number; sessionDate?: string; status?: number }) {
    const { page = 1, pageSize = 10, courseId, sessionDate, status } = dto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.sessionRepository
      .createQueryBuilder('session')
      .where('session.isDeleted = :isDeleted', { isDeleted: 0 });

    if (courseId) {
      queryBuilder.andWhere('session.courseId = :courseId', { courseId });
    }
    if (sessionDate) {
      queryBuilder.andWhere('session.sessionDate = :sessionDate', { sessionDate });
    }
    if (status !== undefined) {
      queryBuilder.andWhere('session.status = :status', { status });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .orderBy('session.sessionDate', 'ASC')
      .addOrderBy('session.startTime', 'ASC')
      .getManyAndCount();

    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }

  async detail(id: number) {
    const session = await this.sessionRepository.findOne({ where: { id } });
    if (!session || session.isDeleted === 1) {
      throw new NotFoundException('课次不存在');
    }

    const bookings = await this.bookingRepository.find({
      where: { sessionId: id, status: 1, isDeleted: 0 },
      order: { createdAt: 'DESC' },
    });

    return { ...session, bookings };
  }

  async updateStatus(id: number, status: number) {
    const session = await this.sessionRepository.findOne({ where: { id } });
    if (!session || session.isDeleted === 1) {
      throw new NotFoundException('课次不存在');
    }
    session.status = status;
    return await this.sessionRepository.save(session);
  }

  async update(id: number, dto: UpdateSessionDto) {
    const session = await this.sessionRepository.findOne({ where: { id } });
    if (!session || session.isDeleted === 1) {
      throw new NotFoundException('课次不存在');
    }

    if (dto.sessionDate !== undefined) session.sessionDate = new Date(dto.sessionDate);
    if (dto.startTime !== undefined) session.startTime = dto.startTime;
    if (dto.endTime !== undefined) session.endTime = dto.endTime;
    if (dto.capacity !== undefined) session.capacity = dto.capacity;

    return await this.sessionRepository.save(session);
  }
}
```

- [ ] **Step 4: Create Session controller**

```ts
// src/gym/session/session.controller.ts
import { Controller, Get, Put, Body, Query, Param } from '@nestjs/common';
import { SessionService } from './session.service';
import { UpdateSessionDto } from '../dto/session.dto';

@Controller('gym/session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get('page')
  async page(@Query() dto: any) {
    return await this.sessionService.page(dto);
  }

  @Get('detail')
  async detail(@Query('id') id: number) {
    return await this.sessionService.detail(id);
  }

  @Put('updateStatus/:id')
  async updateStatus(@Param('id') id: number, @Body('status') status: number) {
    return await this.sessionService.updateStatus(id, status);
  }

  @Put('/:id')
  async update(@Param('id') id: number, @Body() dto: UpdateSessionDto) {
    return await this.sessionService.update(id, dto);
  }
}
```

- [ ] **Step 5: Create Session module**

```ts
// src/gym/session/session.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { CourseSession } from '../entities/course-session.entity';
import { Booking } from '../entities/booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseSession, Booking])],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
```

- [ ] **Step 6: Verify**

- `GET /gym/session/page?courseId=1` — should return sessions for course 1
- `GET /gym/session/detail?id=1` — should return session with bookings

- [ ] **Step 7: Commit**

```bash
cd D:/case/gym-admin/south-admin-nest
git add src/gym/entities/course-session.entity.ts src/gym/dto/session.dto.ts src/gym/session/
git commit -m "feat: add session backend module"
```

---

## Task 5: Booking Backend

**Files:**
- Create: `src/gym/entities/booking.entity.ts`
- Create: `src/gym/dto/booking.dto.ts`
- Create: `src/gym/booking/booking.module.ts`
- Create: `src/gym/booking/booking.controller.ts`
- Create: `src/gym/booking/booking.service.ts`

**Interfaces:**
- Consumes: `BaseEntity`, `PaginationDto`, `CourseSession`, `User` (from system)
- Produces: `Booking` entity, `BookingService`

- [ ] **Step 1: Create Booking entity**

```ts
// src/gym/entities/booking.entity.ts
import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('gym_booking')
export class Booking extends BaseEntity {
  @Column({ type: 'bigint' })
  sessionId: number;

  @Column({ type: 'bigint' })
  userId: number;

  @Column({ type: 'int', default: 1, comment: '1=已预约 2=已取消 3=已完成' })
  status: number;

  @Column({ length: 255, nullable: true })
  remark: string;
}
```

- [ ] **Step 2: Create Booking DTOs**

```ts
// src/gym/dto/booking.dto.ts
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @Type(() => Number)
  @IsInt()
  sessionId: number;

  @Type(() => Number)
  @IsInt()
  userId: number;

  @IsOptional()
  @IsString()
  remark?: string;
}
```

- [ ] **Step 3: Create Booking service**

```ts
// src/gym/booking/booking.service.ts
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../entities/booking.entity';
import { CourseSession } from '../entities/course-session.entity';
import { CreateBookingDto } from '../dto/booking.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(CourseSession)
    private sessionRepository: Repository<CourseSession>,
  ) {}

  async page(dto: PaginationDto & { userId?: number; sessionId?: number; status?: number }) {
    const { page = 1, pageSize = 10, userId, sessionId, status } = dto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.isDeleted = :isDeleted', { isDeleted: 0 });

    if (userId) {
      queryBuilder.andWhere('booking.userId = :userId', { userId });
    }
    if (sessionId) {
      queryBuilder.andWhere('booking.sessionId = :sessionId', { sessionId });
    }
    if (status !== undefined) {
      queryBuilder.andWhere('booking.status = :status', { status });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .orderBy('booking.createdAt', 'DESC')
      .getManyAndCount();

    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }

  async create(dto: CreateBookingDto) {
    const session = await this.sessionRepository.findOne({
      where: { id: dto.sessionId, isDeleted: 0 },
    });

    if (!session) {
      throw new NotFoundException('课次不存在');
    }

    if (session.status !== 1) {
      throw new BadRequestException('该课次当前不可预约');
    }

    // Check duplicate booking
    const existingBooking = await this.bookingRepository.findOne({
      where: {
        sessionId: dto.sessionId,
        userId: dto.userId,
        status: 1,
        isDeleted: 0,
      },
    });

    if (existingBooking) {
      throw new ConflictException('您已预约该课次');
    }

    // Check capacity
    if (session.bookedCount >= session.capacity) {
      throw new BadRequestException('该课次预约已满');
    }

    const booking = this.bookingRepository.create({
      sessionId: dto.sessionId,
      userId: dto.userId,
      status: 1,
      remark: dto.remark,
    });
    const savedBooking = await this.bookingRepository.save(booking);

    // Update session bookedCount
    session.bookedCount += 1;
    if (session.bookedCount >= session.capacity) {
      session.status = 2; // full
    }
    await this.sessionRepository.save(session);

    return savedBooking;
  }

  async cancel(id: number) {
    const booking = await this.bookingRepository.findOne({ where: { id } });
    if (!booking || booking.isDeleted === 1) {
      throw new NotFoundException('预约不存在');
    }
    if (booking.status !== 1) {
      throw new BadRequestException('该预约无法取消');
    }

    booking.status = 2; // cancelled
    await this.bookingRepository.save(booking);

    // Update session bookedCount
    const session = await this.sessionRepository.findOne({
      where: { id: booking.sessionId, isDeleted: 0 },
    });
    if (session) {
      session.bookedCount = Math.max(0, session.bookedCount - 1);
      if (session.status === 2) {
        session.status = 1; // reopen
      }
      await this.sessionRepository.save(session);
    }
  }

  async delete(id: number) {
    const booking = await this.bookingRepository.findOne({ where: { id } });
    if (!booking || booking.isDeleted === 1) {
      throw new NotFoundException('预约不存在');
    }
    booking.isDeleted = 1;
    booking.deletedAt = new Date();
    await this.bookingRepository.save(booking);
  }
}
```

- [ ] **Step 4: Create Booking controller**

```ts
// src/gym/booking/booking.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Query, Param } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from '../dto/booking.dto';

@Controller('gym/booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get('page')
  async page(@Query() dto: any) {
    return await this.bookingService.page(dto);
  }

  @Post('create')
  async create(@Body() dto: CreateBookingDto) {
    return await this.bookingService.create(dto);
  }

  @Put('cancel/:id')
  async cancel(@Param('id') id: number) {
    await this.bookingService.cancel(id);
    return { message: '取消成功' };
  }

  @Delete('/:id')
  async delete(@Param('id') id: number) {
    await this.bookingService.delete(id);
    return { message: '删除成功' };
  }
}
```

- [ ] **Step 5: Create Booking module**

```ts
// src/gym/booking/booking.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { Booking } from '../entities/booking.entity';
import { CourseSession } from '../entities/course-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, CourseSession])],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
```

- [ ] **Step 6: Verify**

Test booking flow:
- `POST /gym/booking/create` with `{"sessionId": 1, "userId": 1}`
- Try duplicate: should return 409 ConflictException
- `PUT /gym/booking/cancel/1` — should succeed and session bookedCount decreases

- [ ] **Step 7: Commit**

```bash
cd D:/case/gym-admin/south-admin-nest
git add src/gym/entities/booking.entity.ts src/gym/dto/booking.dto.ts src/gym/booking/
git commit -m "feat: add booking backend module with conflict detection"
```

---

## Task 6: Register Gym Modules in Backend

**Files:**
- Create: `src/gym/gym.module.ts`
- Modify: `src/app.module.ts`

**Interfaces:**
- Consumes: `CourseTypeModule`, `LocationModule`, `CourseModule`, `SessionModule`, `BookingModule`
- Produces: `GymModule` registered in `AppModule`

- [ ] **Step 1: Create GymModule (aggregator)**

```ts
// src/gym/gym.module.ts
import { Module } from '@nestjs/common';
import { CourseTypeModule } from './course-type/course-type.module';
import { LocationModule } from './location/location.module';
import { CourseModule } from './course/course.module';
import { SessionModule } from './session/session.module';
import { BookingModule } from './booking/booking.module';

@Module({
  imports: [
    CourseTypeModule,
    LocationModule,
    CourseModule,
    SessionModule,
    BookingModule,
  ],
  exports: [
    CourseTypeModule,
    LocationModule,
    CourseModule,
    SessionModule,
    BookingModule,
  ],
})
export class GymModule {}
```

- [ ] **Step 2: Register GymModule and entities in app.module.ts**

Add imports and entities to `src/app.module.ts`. The entity list and imports array need updating:

```ts
// Add to imports at top of file:
import { GymModule } from './gym/gym.module';
import { CourseType } from './gym/entities/course-type.entity';
import { Location } from './gym/entities/location.entity';
import { Course } from './gym/entities/course.entity';
import { CourseSession } from './gym/entities/course-session.entity';
import { Booking } from './gym/entities/booking.entity';
```

In the `TypeOrmModule.forRootAsync` entities array, add:
```ts
entities: [User, Role, Permission, Menu, Article, Log, CourseType, Location, Course, CourseSession, Booking],
```

In the `imports` array of `@Module`, add:
```ts
GymModule,
```

- [ ] **Step 3: Verify — full backend test**

Run backend and verify all endpoints:
```
GET  /gym/course-type/list
GET  /gym/location/list
GET  /gym/course/page
GET  /gym/session/page?courseId=1
GET  /gym/booking/page
```

- [ ] **Step 4: Commit**

```bash
cd D:/case/gym-admin/south-admin-nest
git add src/gym/gym.module.ts src/app.module.ts
git commit -m "feat: register gym module in app"
```

---

## Task 7: Frontend API Files

**Files:**
- Create: `src/servers/gym/course-type.ts`
- Create: `src/servers/gym/location.ts`
- Create: `src/servers/gym/course.ts`
- Create: `src/servers/gym/session.ts`
- Create: `src/servers/gym/booking.ts`

**Interfaces:**
- Consumes: `request` from `@/utils/request`, `BaseFormData`, `PageServerResult`, `PaginationData`
- Produces: API functions used by all frontend pages

- [ ] **Step 1: Create CourseType API**

```ts
// src/servers/gym/course-type.ts
import type { BaseFormData } from '#/form';
import type { PageServerResult, PaginationData } from '#/public';
import { request } from '@/utils/request';

enum API {
  URL = '/gym/course-type',
}

export function getCourseTypePage(data: Partial<BaseFormData> & PaginationData) {
  return request.get<PageServerResult<BaseFormData[]>>(`${API.URL}/page`, { params: data });
}

export function getCourseTypeList() {
  return request.get<BaseFormData[]>(`${API.URL}/list`);
}

export function getCourseTypeById(id: string) {
  return request.get<BaseFormData>(`${API.URL}/detail?id=${id}`);
}

export function createCourseType(data: BaseFormData) {
  return request.post(`${API.URL}/create`, data);
}

export function updateCourseType(id: string, data: BaseFormData) {
  return request.put(`${API.URL}/update/${id}`, data);
}

export function deleteCourseType(id: string) {
  return request.delete(`${API.URL}/${id}`);
}
```

- [ ] **Step 2: Create Location API**

```ts
// src/servers/gym/location.ts
import type { BaseFormData } from '#/form';
import type { PageServerResult, PaginationData } from '#/public';
import { request } from '@/utils/request';

enum API {
  URL = '/gym/location',
}

export function getLocationPage(data: Partial<BaseFormData> & PaginationData) {
  return request.get<PageServerResult<BaseFormData[]>>(`${API.URL}/page`, { params: data });
}

export function getLocationList() {
  return request.get<BaseFormData[]>(`${API.URL}/list`);
}

export function getLocationById(id: string) {
  return request.get<BaseFormData>(`${API.URL}/detail?id=${id}`);
}

export function createLocation(data: BaseFormData) {
  return request.post(`${API.URL}/create`, data);
}

export function updateLocation(id: string, data: BaseFormData) {
  return request.put(`${API.URL}/update/${id}`, data);
}

export function deleteLocation(id: string) {
  return request.delete(`${API.URL}/${id}`);
}
```

- [ ] **Step 3: Create Course API**

```ts
// src/servers/gym/course.ts
import type { BaseFormData } from '#/form';
import type { PageServerResult, PaginationData } from '#/public';
import { request } from '@/utils/request';

enum API {
  URL = '/gym/course',
}

export function getCoursePage(data: Partial<BaseFormData> & PaginationData) {
  return request.get<PageServerResult<BaseFormData[]>>(`${API.URL}/page`, { params: data });
}

export function getCourseById(id: string) {
  return request.get<BaseFormData>(`${API.URL}/detail?id=${id}`);
}

export function createCourse(data: BaseFormData) {
  return request.post(`${API.URL}/create`, data);
}

export function updateCourse(id: string, data: BaseFormData) {
  return request.put(`${API.URL}/update/${id}`, data);
}

export function updateCourseStatus(id: string, data: BaseFormData) {
  return request.put(`${API.URL}/updateStatus/${id}`, data);
}

export function deleteCourse(id: string) {
  return request.delete(`${API.URL}/${id}`);
}

export function getCourseStats() {
  return request.get<BaseFormData>(`${API.URL}/stats`);
}
```

- [ ] **Step 4: Create Session API**

```ts
// src/servers/gym/session.ts
import type { BaseFormData } from '#/form';
import type { PageServerResult, PaginationData } from '#/public';
import { request } from '@/utils/request';

enum API {
  URL = '/gym/session',
}

export function getSessionPage(data: Partial<BaseFormData> & PaginationData) {
  return request.get<PageServerResult<BaseFormData[]>>(`${API.URL}/page`, { params: data });
}

export function getSessionById(id: string) {
  return request.get<BaseFormData>(`${API.URL}/detail?id=${id}`);
}

export function updateSession(id: string, data: BaseFormData) {
  return request.put(`${API.URL}/${id}`, data);
}

export function updateSessionStatus(id: string, data: BaseFormData) {
  return request.put(`${API.URL}/updateStatus/${id}`, data);
}
```

- [ ] **Step 5: Create Booking API**

```ts
// src/servers/gym/booking.ts
import type { BaseFormData } from '#/form';
import type { PageServerResult, PaginationData } from '#/public';
import { request } from '@/utils/request';

enum API {
  URL = '/gym/booking',
}

export function getBookingPage(data: Partial<BaseFormData> & PaginationData) {
  return request.get<PageServerResult<BaseFormData[]>>(`${API.URL}/page`, { params: data });
}

export function createBooking(data: BaseFormData) {
  return request.post(`${API.URL}/create`, data);
}

export function cancelBooking(id: string) {
  return request.put(`${API.URL}/cancel/${id}`);
}

export function deleteBooking(id: string) {
  return request.delete(`${API.URL}/${id}`);
}
```

- [ ] **Step 6: Commit**

```bash
cd D:/case/gym-admin/south-admin-react
git add src/servers/gym/
git commit -m "feat: add gym module API files"
```

---

## Task 8: CourseType Frontend Page

**Files:**
- Create: `src/pages/gym/course-type/model.ts`
- Create: `src/pages/gym/course-type/index.tsx`

**Interfaces:**
- Consumes: `getCourseTypePage`, `getCourseTypeById`, `createCourseType`, `updateCourseType`, `deleteCourseType` from API file
- Produces: `/gym/course-type` route (auto-generated from file path)

- [ ] **Step 1: Create CourseType model**

```ts
// src/pages/gym/course-type/model.ts
import type { TFunction } from 'i18next';
import type { BaseSearchList } from '#/form';
import type { TableColumn, TableOptions } from '#/public';

export const searchList = (t: TFunction): BaseSearchList[] => [
  {
    label: t('gym.courseTypeName'),
    name: 'name',
    component: 'Input',
  },
];

export const tableColumns = (t: TFunction, optionRender: TableOptions<object>): TableColumn[] => {
  return [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: t('gym.courseTypeName'), dataIndex: 'name', width: 150 },
    { title: t('gym.description'), dataIndex: 'description', width: 250, ellipsis: true },
    { title: t('gym.sortOrder'), dataIndex: 'order', width: 100 },
    { title: t('public.creationTime'), dataIndex: 'createdAt', width: 170 },
    {
      title: t('public.operate'),
      dataIndex: 'operate',
      width: 150,
      fixed: 'right',
      render: (value: unknown, record: object) => optionRender(value, record),
    },
  ];
};

export const createList = (t: TFunction): BaseFormList[] => [
  {
    label: t('gym.courseTypeName'),
    name: 'name',
    rules: FORM_REQUIRED,
    component: 'Input',
  },
  {
    label: t('gym.description'),
    name: 'description',
    component: 'Input',
  },
  {
    label: t('gym.sortOrder'),
    name: 'order',
    component: 'InputNumber',
    componentProps: {
      min: 0,
      style: { width: '100%' },
    },
  },
];
```

- [ ] **Step 2: Create CourseType page**

```tsx
// src/pages/gym/course-type/index.tsx
import type { BaseFormData } from '#/form';
import type { PagePermission } from '#/public';
import { useEffectOnActive } from 'keepalive-for-react';
import { type FormInstance, Form, message } from 'antd';
import { useMemo, useCallback } from 'react';
import { searchList, tableColumns, createList } from './model';
import {
  getCourseTypePage,
  getCourseTypeById,
  createCourseType,
  updateCourseType,
  deleteCourseType,
} from '@/servers/gym/course-type';

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

  const permissionPrefix = '/gym/course-type';
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
      const { code, data } = await getCourseTypePage(params);
      if (Number(code) !== 200) return;
      const { items, total } = data;
      setTotal(total || 0);
      setTableData(items || []);
    } finally {
      setFetch(false);
      setLoading(false);
    }
  }, [page, pageSize, searchData]);

  useEffect(() => {
    if (isFetch) getPage();
  }, [isFetch]);

  useEffect(() => {
    if (pagePermission.page) getPage();
  }, [pagePermission.page]);

  useEffectOnActive(() => {
    getPage();
  }, []);

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
      const { code, data } = await getCourseTypeById(id);
      if (Number(code) !== 200) return;
      setCreateData(data);
    } finally {
      setCreateLoading(false);
    }
  };

  const createSubmit = () => {
    createFormRef.current?.submit();
  };

  const closeCreate = () => {
    setCreateOpen(false);
  };

  const handleCreate = async (values: BaseFormData) => {
    try {
      setCreateLoading(true);
      const fn = () => (createId ? updateCourseType(createId, values) : createCourseType(values));
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
      const { code, message } = await deleteCourseType(id);
      if (Number(code) === 200) {
        messageApi.success(message || t('public.successfullyDeleted'));
        getPage();
      }
    } finally {
      setLoading(false);
    }
  };

  const onChangePagination = useCallback((page: number, pageSize: number) => {
    setPage(page);
    setPageSize(pageSize);
    setFetch(true);
  }, []);

  const optionRender = useCallback(
    (_: unknown, record: object) => (
      <div className="flex flex-wrap gap-5px">
        {pagePermission.update === true && (
          <UpdateBtn onClick={() => onUpdate((record as RowData).id)} />
        )}
        {pagePermission.delete === true && (
          <DeleteBtn
            name={(record as RowData).name}
            handleDelete={() => onDelete((record as RowData).id)}
          />
        )}
      </div>
    ),
    [pagePermission.update, pagePermission.delete, onUpdate, onDelete],
  );

  const columns = useMemo(() => tableColumns(t, optionRender), [t, optionRender]);

  return (
    <BaseContent isPermission={pagePermission.page}>
      {contextHolder}
      <BaseCard>
        <BaseSearch
          list={searchList(t)}
          data={searchData}
          isLoading={isLoading}
          handleFinish={onSearch}
        />
      </BaseCard>

      <BaseCard className="mt-10px">
        <BaseTable
          isLoading={isLoading}
          isCreate={pagePermission.create}
          columns={columns}
          dataSource={tableData}
          getPage={getPage}
          onCreate={onCreate}
        />
        <BasePagination
          disabled={isLoading}
          current={page}
          pageSize={pageSize}
          total={total}
          onChange={onChangePagination}
        />
      </BaseCard>

      <BaseModal
        title={createTitle}
        open={isCreateOpen}
        confirmLoading={isCreateLoading}
        onOk={createSubmit}
        onCancel={closeCreate}
      >
        <BaseForm
          form={form}
          ref={createFormRef}
          list={createList(t)}
          labelCol={{ span: 5 }}
          data={createData}
          handleFinish={handleCreate}
        />
      </BaseModal>
    </BaseContent>
  );
}

export default Page;
```

- [ ] **Step 3: Commit**

```bash
cd D:/case/gym-admin/south-admin-react
git add src/pages/gym/course-type/
git commit -m "feat: add course type management page"
```

---

## Task 9: Location Frontend Page

**Files:**
- Create: `src/pages/gym/location/model.ts`
- Create: `src/pages/gym/location/index.tsx`

**Interfaces:**
- Consumes: Location API functions
- Produces: `/gym/location` route

- [ ] **Step 1: Create Location model**

```ts
// src/pages/gym/location/model.ts
import type { TFunction } from 'i18next';
import type { BaseSearchList } from '#/form';
import type { TableColumn, TableOptions } from '#/public';

export const searchList = (t: TFunction): BaseSearchList[] => [
  {
    label: t('gym.locationName'),
    name: 'name',
    component: 'Input',
  },
];

export const tableColumns = (t: TFunction, optionRender: TableOptions<object>): TableColumn[] => {
  return [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: t('gym.locationName'), dataIndex: 'name', width: 150 },
    { title: t('gym.address'), dataIndex: 'address', width: 250, ellipsis: true },
    { title: t('gym.capacity'), dataIndex: 'capacity', width: 120 },
    { title: t('public.creationTime'), dataIndex: 'createdAt', width: 170 },
    {
      title: t('public.operate'),
      dataIndex: 'operate',
      width: 150,
      fixed: 'right',
      render: (value: unknown, record: object) => optionRender(value, record),
    },
  ];
};

export const createList = (t: TFunction): BaseFormList[] => [
  {
    label: t('gym.locationName'),
    name: 'name',
    rules: FORM_REQUIRED,
    component: 'Input',
  },
  {
    label: t('gym.address'),
    name: 'address',
    component: 'Input',
  },
  {
    label: t('gym.capacity'),
    name: 'capacity',
    component: 'InputNumber',
    componentProps: {
      min: 1,
      style: { width: '100%' },
    },
  },
];
```

- [ ] **Step 2: Create Location page**

Follow the exact same pattern as CourseType page (Task 8), replacing:
- API imports: `getLocationPage`, `getLocationById`, `createLocation`, `updateLocation`, `deleteLocation` from `@/servers/gym/location`
- Model imports: `searchList`, `tableColumns`, `createList` from `./model`
- Permission prefix: `/gym/location`

```tsx
// src/pages/gym/location/index.tsx
import type { BaseFormData } from '#/form';
import type { PagePermission } from '#/public';
import { useEffectOnActive } from 'keepalive-for-react';
import { type FormInstance, Form, message } from 'antd';
import { useMemo, useCallback } from 'react';
import { searchList, tableColumns, createList } from './model';
import {
  getLocationPage,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
} from '@/servers/gym/location';

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

  const permissionPrefix = '/gym/location';
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
      const { code, data } = await getLocationPage(params);
      if (Number(code) !== 200) return;
      const { items, total } = data;
      setTotal(total || 0);
      setTableData(items || []);
    } finally {
      setFetch(false);
      setLoading(false);
    }
  }, [page, pageSize, searchData]);

  useEffect(() => {
    if (isFetch) getPage();
  }, [isFetch]);

  useEffect(() => {
    if (pagePermission.page) getPage();
  }, [pagePermission.page]);

  useEffectOnActive(() => {
    getPage();
  }, []);

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
      const { code, data } = await getLocationById(id);
      if (Number(code) !== 200) return;
      setCreateData(data);
    } finally {
      setCreateLoading(false);
    }
  };

  const createSubmit = () => {
    createFormRef.current?.submit();
  };

  const closeCreate = () => {
    setCreateOpen(false);
  };

  const handleCreate = async (values: BaseFormData) => {
    try {
      setCreateLoading(true);
      const fn = () => (createId ? updateLocation(createId, values) : createLocation(values));
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
      const { code, message } = await deleteLocation(id);
      if (Number(code) === 200) {
        messageApi.success(message || t('public.successfullyDeleted'));
        getPage();
      }
    } finally {
      setLoading(false);
    }
  };

  const onChangePagination = useCallback((page: number, pageSize: number) => {
    setPage(page);
    setPageSize(pageSize);
    setFetch(true);
  }, []);

  const optionRender = useCallback(
    (_: unknown, record: object) => (
      <div className="flex flex-wrap gap-5px">
        {pagePermission.update === true && (
          <UpdateBtn onClick={() => onUpdate((record as RowData).id)} />
        )}
        {pagePermission.delete === true && (
          <DeleteBtn
            name={(record as RowData).name}
            handleDelete={() => onDelete((record as RowData).id)}
          />
        )}
      </div>
    ),
    [pagePermission.update, pagePermission.delete, onUpdate, onDelete],
  );

  const columns = useMemo(() => tableColumns(t, optionRender), [t, optionRender]);

  return (
    <BaseContent isPermission={pagePermission.page}>
      {contextHolder}
      <BaseCard>
        <BaseSearch
          list={searchList(t)}
          data={searchData}
          isLoading={isLoading}
          handleFinish={onSearch}
        />
      </BaseCard>

      <BaseCard className="mt-10px">
        <BaseTable
          isLoading={isLoading}
          isCreate={pagePermission.create}
          columns={columns}
          dataSource={tableData}
          getPage={getPage}
          onCreate={onCreate}
        />
        <BasePagination
          disabled={isLoading}
          current={page}
          pageSize={pageSize}
          total={total}
          onChange={onChangePagination}
        />
      </BaseCard>

      <BaseModal
        title={createTitle}
        open={isCreateOpen}
        confirmLoading={isCreateLoading}
        onOk={createSubmit}
        onCancel={closeCreate}
      >
        <BaseForm
          form={form}
          ref={createFormRef}
          list={createList(t)}
          labelCol={{ span: 5 }}
          data={createData}
          handleFinish={handleCreate}
        />
      </BaseModal>
    </BaseContent>
  );
}

export default Page;
```

- [ ] **Step 3: Commit**

```bash
cd D:/case/gym-admin/south-admin-react
git add src/pages/gym/location/
git commit -m "feat: add location management page"
```

---

## Task 10: Course Frontend Page

**Files:**
- Create: `src/pages/gym/course/model.tsx`
- Create: `src/pages/gym/course/index.tsx`

**Interfaces:**
- Consumes: Course API, CourseType API (for ApiSelect), Location API (for ApiSelect), Session API (for drawer)
- Produces: `/gym/course` route

- [ ] **Step 1: Create Course model**

```tsx
// src/pages/gym/course/model.tsx
import type { TFunction } from 'i18next';
import type { BaseSearchList } from '#/form';
import type { TableColumn, TableOptions } from '#/public';
import { getCourseTypeList } from '@/servers/gym/course-type';
import { getLocationList } from '@/servers/gym/location';

export const searchList = (t: TFunction): BaseSearchList[] => [
  {
    label: t('gym.courseName'),
    name: 'name',
    component: 'Input',
  },
  {
    label: t('gym.courseType'),
    name: 'typeId',
    component: 'ApiSelect',
    componentProps: {
      api: getCourseTypeList as ApiFn,
      fieldNames: { label: 'name', value: 'id' },
      allowClear: true,
    },
  },
  {
    label: t('gym.status'),
    name: 'status',
    component: 'Select',
    componentProps: {
      options: [
        { label: t('gym.statusOpen'), value: 1 },
        { label: t('gym.statusFull'), value: 2 },
        { label: t('gym.statusCancelled'), value: 3 },
        { label: t('gym.statusEnded'), value: 4 },
      ],
      allowClear: true,
    },
  },
];

export const tableColumns = (t: TFunction, optionRender: TableOptions<object>): TableColumn[] => {
  return [
    { title: 'ID', dataIndex: 'id', width: 70 },
    { title: t('gym.courseName'), dataIndex: 'name', width: 150 },
    { title: t('gym.courseType'), dataIndex: 'typeId', width: 100 },
    { title: t('gym.location'), dataIndex: 'locationId', width: 120 },
    { title: t('gym.instructor'), dataIndex: 'instructor', width: 100 },
    {
      title: t('gym.status'),
      dataIndex: 'status',
      width: 100,
      enum: [
        { label: t('gym.statusOpen'), value: 1, color: 'green', type: 'tag' },
        { label: t('gym.statusFull'), value: 2, color: 'orange', type: 'tag' },
        { label: t('gym.statusCancelled'), value: 3, color: 'red', type: 'tag' },
        { label: t('gym.statusEnded'), value: 4, color: 'default', type: 'tag' },
      ],
    },
    { title: t('gym.isRecurring'), dataIndex: 'isRecurring', width: 100 },
    { title: t('gym.capacity'), dataIndex: 'capacity', width: 80 },
    { title: t('public.creationTime'), dataIndex: 'createdAt', width: 170 },
    {
      title: t('public.operate'),
      dataIndex: 'operate',
      width: 180,
      fixed: 'right',
      render: (value: unknown, record: object) => optionRender(value, record),
    },
  ];
};

export const createList = (t: TFunction, isCreate: boolean): BaseFormList[] => [
  {
    label: t('gym.courseName'),
    name: 'name',
    rules: FORM_REQUIRED,
    component: 'Input',
  },
  {
    label: t('gym.courseType'),
    name: 'typeId',
    rules: FORM_REQUIRED,
    component: 'ApiSelect',
    componentProps: {
      api: getCourseTypeList as ApiFn,
      fieldNames: { label: 'name', value: 'id' },
    },
  },
  {
    label: t('gym.location'),
    name: 'locationId',
    rules: FORM_REQUIRED,
    component: 'ApiSelect',
    componentProps: {
      api: getLocationList as ApiFn,
      fieldNames: { label: 'name', value: 'id' },
    },
  },
  {
    label: t('gym.instructor'),
    name: 'instructor',
    component: 'Input',
  },
  {
    label: t('gym.description'),
    name: 'description',
    component: 'Input',
  },
  {
    label: t('gym.capacity'),
    name: 'capacity',
    rules: FORM_REQUIRED,
    component: 'InputNumber',
    componentProps: {
      min: 1,
      style: { width: '100%' },
    },
  },
  {
    label: t('gym.startDate'),
    name: 'startDate',
    rules: isCreate ? FORM_REQUIRED : undefined,
    component: 'DatePicker',
    componentProps: {
      style: { width: '100%' },
    },
  },
  {
    label: t('gym.startTime'),
    name: 'startTime',
    component: 'TimePicker',
    componentProps: {
      format: 'HH:mm',
      style: { width: '100%' },
    },
  },
  {
    label: t('gym.endTime'),
    name: 'endTime',
    component: 'TimePicker',
    componentProps: {
      format: 'HH:mm',
      style: { width: '100%' },
    },
  },
];
```

- [ ] **Step 2: Create Course page**

This is the most complex page. It has a standard CRUD list + a Drawer for session management.

```tsx
// src/pages/gym/course/index.tsx
import type { BaseFormData } from '#/form';
import type { PagePermission } from '#/public';
import { useEffectOnActive } from 'keepalive-for-react';
import { type FormInstance, Form, message, Drawer, Table, Tag, Button } from 'antd';
import { useMemo, useCallback, useState } from 'react';
import { searchList, tableColumns, createList } from './model';
import {
  getCoursePage,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from '@/servers/gym/course';
import { getSessionPage } from '@/servers/gym/session';

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

  // Session drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerCourseId, setDrawerCourseId] = useState<number | null>(null);
  const [sessionData, setSessionData] = useState<BaseFormData[]>([]);
  const [sessionLoading, setSessionLoading] = useState(false);

  const permissionPrefix = '/gym/course';
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
      const { code, data } = await getCoursePage(params);
      if (Number(code) !== 200) return;
      const { items, total } = data;
      setTotal(total || 0);
      setTableData(items || []);
    } finally {
      setFetch(false);
      setLoading(false);
    }
  }, [page, pageSize, searchData]);

  useEffect(() => {
    if (isFetch) getPage();
  }, [isFetch]);

  useEffect(() => {
    if (pagePermission.page) getPage();
  }, [pagePermission.page]);

  useEffectOnActive(() => {
    getPage();
  }, []);

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
      const { code, data } = await getCourseById(id);
      if (Number(code) !== 200) return;
      setCreateData(data);
    } finally {
      setCreateLoading(false);
    }
  };

  const createSubmit = () => {
    createFormRef.current?.submit();
  };

  const closeCreate = () => {
    setCreateOpen(false);
  };

  const handleCreate = async (values: BaseFormData) => {
    try {
      setCreateLoading(true);
      const fn = () => (createId ? updateCourse(createId, values) : createCourse(values));
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
      const { code, message } = await deleteCourse(id);
      if (Number(code) === 200) {
        messageApi.success(message || t('public.successfullyDeleted'));
        getPage();
      }
    } finally {
      setLoading(false);
    }
  };

  // Session drawer
  const onOpenSessions = async (courseId: number) => {
    setDrawerOpen(true);
    setDrawerCourseId(courseId);
    try {
      setSessionLoading(true);
      const { code, data } = await getSessionPage({ courseId, page: 1, pageSize: 100 });
      if (Number(code) === 200) {
        setSessionData(data?.items || []);
      }
    } finally {
      setSessionLoading(false);
    }
  };

  const sessionColumns = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    { title: t('gym.sessionDate'), dataIndex: 'sessionDate', width: 120 },
    { title: t('gym.startTime'), dataIndex: 'startTime', width: 100 },
    { title: t('gym.endTime'), dataIndex: 'endTime', width: 100 },
    { title: t('gym.bookedCount'), dataIndex: 'bookedCount', width: 100 },
    { title: t('gym.capacity'), dataIndex: 'capacity', width: 80 },
    {
      title: t('gym.status'),
      dataIndex: 'status',
      width: 100,
      render: (status: number) => {
        const map: Record<number, { color: string; text: string }> = {
          1: { color: 'green', text: t('gym.statusOpen') },
          2: { color: 'orange', text: t('gym.statusFull') },
          3: { color: 'red', text: t('gym.statusCancelled') },
          4: { color: 'default', text: t('gym.statusEnded') },
        };
        const s = map[status] || map[1];
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
  ];

  const onChangePagination = useCallback((page: number, pageSize: number) => {
    setPage(page);
    setPageSize(pageSize);
    setFetch(true);
  }, []);

  const optionRender = useCallback(
    (_: unknown, record: object) => (
      <div className="flex flex-wrap gap-5px">
        <Button size="small" type="link" onClick={() => onOpenSessions((record as RowData).id as unknown as number)}>
          {t('gym.viewSessions')}
        </Button>
        {pagePermission.update === true && (
          <UpdateBtn onClick={() => onUpdate((record as RowData).id)} />
        )}
        {pagePermission.delete === true && (
          <DeleteBtn
            name={(record as RowData).name}
            handleDelete={() => onDelete((record as RowData).id)}
          />
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
        <BaseSearch
          list={searchList(t)}
          data={searchData}
          isLoading={isLoading}
          handleFinish={onSearch}
        />
      </BaseCard>

      <BaseCard className="mt-10px">
        <BaseTable
          isLoading={isLoading}
          isCreate={pagePermission.create}
          columns={columns}
          dataSource={tableData}
          getPage={getPage}
          onCreate={onCreate}
        />
        <BasePagination
          disabled={isLoading}
          current={page}
          pageSize={pageSize}
          total={total}
          onChange={onChangePagination}
        />
      </BaseCard>

      <BaseModal
        title={createTitle}
        open={isCreateOpen}
        confirmLoading={isCreateLoading}
        onOk={createSubmit}
        onCancel={closeCreate}
        width={600}
      >
        <BaseForm
          form={form}
          ref={createFormRef}
          list={createList(t, !createId)}
          labelCol={{ span: 5 }}
          data={createData}
          handleFinish={handleCreate}
        />
      </BaseModal>

      <Drawer
        title={t('gym.sessionManagement')}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={700}
      >
        <Table
          columns={sessionColumns}
          dataSource={sessionData}
          loading={sessionLoading}
          rowKey="id"
          size="small"
          pagination={false}
        />
      </Drawer>
    </BaseContent>
  );
}

export default Page;
```

- [ ] **Step 3: Commit**

```bash
cd D:/case/gym-admin/south-admin-react
git add src/pages/gym/course/
git commit -m "feat: add course management page with session drawer"
```

---

## Task 11: Booking Frontend Page

**Files:**
- Create: `src/pages/gym/booking/model.ts`
- Create: `src/pages/gym/booking/index.tsx`

**Interfaces:**
- Consumes: Booking API, Course API (for ApiSelect), Session API (for cascading ApiSelect), User API (for ApiSelect)
- Produces: `/gym/booking` route

- [ ] **Step 1: Create Booking model**

```ts
// src/pages/gym/booking/model.ts
import type { TFunction } from 'i18next';
import type { BaseSearchList } from '#/form';
import type { TableColumn, TableOptions } from '#/public';
import { getCoursePage } from '@/servers/gym/course';
import { getSessionPage } from '@/servers/gym/session';
import { getUserPage } from '@/servers/system/user';

export const searchList = (t: TFunction): BaseSearchList[] => [
  {
    label: t('gym.userName'),
    name: 'userId',
    component: 'ApiSelect',
    componentProps: {
      api: getUserPage as ApiFn,
      apiResultKey: 'items',
      fieldNames: { label: 'username', value: 'id' },
      allowClear: true,
    },
  },
  {
    label: t('gym.status'),
    name: 'status',
    component: 'Select',
    componentProps: {
      options: [
        { label: t('gym.bookingConfirmed'), value: 1 },
        { label: t('gym.bookingCancelled'), value: 2 },
        { label: t('gym.bookingCompleted'), value: 3 },
      ],
      allowClear: true,
    },
  },
];

export const tableColumns = (t: TFunction, optionRender: TableOptions<object>): TableColumn[] => {
  return [
    { title: 'ID', dataIndex: 'id', width: 70 },
    { title: t('gym.userId'), dataIndex: 'userId', width: 100 },
    { title: t('gym.sessionId'), dataIndex: 'sessionId', width: 100 },
    {
      title: t('gym.status'),
      dataIndex: 'status',
      width: 100,
      enum: [
        { label: t('gym.bookingConfirmed'), value: 1, color: 'green', type: 'tag' },
        { label: t('gym.bookingCancelled'), value: 2, color: 'red', type: 'tag' },
        { label: t('gym.bookingCompleted'), value: 3, color: 'blue', type: 'tag' },
      ],
    },
    { title: t('gym.remark'), dataIndex: 'remark', width: 200, ellipsis: true },
    { title: t('public.creationTime'), dataIndex: 'createdAt', width: 170 },
    {
      title: t('public.operate'),
      dataIndex: 'operate',
      width: 150,
      fixed: 'right',
      render: (value: unknown, record: object) => optionRender(value, record),
    },
  ];
};

export const createList = (t: TFunction): BaseFormList[] => [
  {
    label: t('gym.courseName'),
    name: 'courseId',
    rules: FORM_REQUIRED,
    component: 'ApiSelect',
    componentProps: {
      api: getCoursePage as ApiFn,
      apiResultKey: 'items',
      fieldNames: { label: 'name', value: 'id' },
      params: { status: 1, page: 1, pageSize: 100 },
    },
  },
  {
    label: t('gym.sessionDate'),
    name: 'sessionId',
    rules: FORM_REQUIRED,
    component: 'ApiSelect',
    componentProps: {
      api: getSessionPage as ApiFn,
      apiResultKey: 'items',
      fieldNames: { label: 'sessionDate', value: 'id' },
      params: { status: 1, page: 1, pageSize: 100 },
      showSearch: true,
      filterOption: (input: string, option: any) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
    },
  },
  {
    label: t('gym.userName'),
    name: 'userId',
    rules: FORM_REQUIRED,
    component: 'ApiSelect',
    componentProps: {
      api: getUserPage as ApiFn,
      apiResultKey: 'items',
      fieldNames: { label: 'username', value: 'id' },
      params: { page: 1, pageSize: 50 },
      showSearch: true,
      filterOption: (input: string, option: any) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
    },
  },
  {
    label: t('gym.remark'),
    name: 'remark',
    component: 'Input',
  },
];
```

- [ ] **Step 2: Create Booking page**

```tsx
// src/pages/gym/booking/index.tsx
import type { BaseFormData } from '#/form';
import type { PagePermission } from '#/public';
import { useEffectOnActive } from 'keepalive-for-react';
import { type FormInstance, Form, message } from 'antd';
import { useMemo, useCallback } from 'react';
import { searchList, tableColumns, createList } from './model';
import {
  getBookingPage,
  createBooking,
  cancelBooking,
  deleteBooking,
} from '@/servers/gym/booking';

interface RowData {
  id: string;
  userId: string;
}

function Page() {
  const { t } = useTranslation();
  const createFormRef = useRef<FormInstance>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [isFetch, setFetch] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isCreateLoading, setCreateLoading] = useState(false);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [searchData, setSearchData] = useState<BaseFormData>({});
  const [page, setPage] = useState(INIT_PAGINATION.page);
  const [pageSize, setPageSize] = useState(INIT_PAGINATION.pageSize);
  const [total, setTotal] = useState(0);
  const [tableData, setTableData] = useState<BaseFormData[]>([]);
  const [form] = Form.useForm();
  const { permissions } = useCommonStore();

  const permissionPrefix = '/gym/booking';
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
      const { code, data } = await getBookingPage(params);
      if (Number(code) !== 200) return;
      const { items, total } = data;
      setTotal(total || 0);
      setTableData(items || []);
    } finally {
      setFetch(false);
      setLoading(false);
    }
  }, [page, pageSize, searchData]);

  useEffect(() => {
    if (isFetch) getPage();
  }, [isFetch]);

  useEffect(() => {
    if (pagePermission.page) getPage();
  }, [pagePermission.page]);

  useEffectOnActive(() => {
    getPage();
  }, []);

  const onSearch = (values: BaseFormData) => {
    setPage(1);
    setSearchData(values);
    setFetch(true);
  };

  const onCreate = () => {
    setCreateOpen(true);
    form.resetFields();
  };

  const createSubmit = () => {
    createFormRef.current?.submit();
  };

  const closeCreate = () => {
    setCreateOpen(false);
  };

  const handleCreate = async (values: BaseFormData) => {
    try {
      setCreateLoading(true);
      const { code, message } = await createBooking(values);
      if (Number(code) !== 200) return;
      messageApi.success(message || t('public.successfulOperation'));
      setCreateOpen(false);
      getPage();
    } finally {
      setCreateLoading(false);
    }
  };

  const onCancelBooking = async (id: string) => {
    try {
      setLoading(true);
      const { code, message } = await cancelBooking(id);
      if (Number(code) === 200) {
        messageApi.success(message || t('public.successfulOperation'));
        getPage();
      }
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id: string) => {
    try {
      setLoading(true);
      const { code, message } = await deleteBooking(id);
      if (Number(code) === 200) {
        messageApi.success(message || t('public.successfullyDeleted'));
        getPage();
      }
    } finally {
      setLoading(false);
    }
  };

  const onChangePagination = useCallback((page: number, pageSize: number) => {
    setPage(page);
    setPageSize(pageSize);
    setFetch(true);
  }, []);

  const optionRender = useCallback(
    (_: unknown, record: object) => (
      <div className="flex flex-wrap gap-5px">
        {(record as RowData).id && pagePermission.update === true && (
          <DeleteBtn
            name={t('gym.cancelBooking')}
            handleDelete={() => onCancelBooking((record as RowData).id)}
            btnText={t('gym.cancelBooking')}
          />
        )}
        {pagePermission.delete === true && (
          <DeleteBtn
            name={(record as RowData).userId}
            handleDelete={() => onDelete((record as RowData).id)}
          />
        )}
      </div>
    ),
    [pagePermission.update, pagePermission.delete, onCancelBooking, onDelete, t],
  );

  const columns = useMemo(() => tableColumns(t, optionRender), [t, optionRender]);

  return (
    <BaseContent isPermission={pagePermission.page}>
      {contextHolder}
      <BaseCard>
        <BaseSearch
          list={searchList(t)}
          data={searchData}
          isLoading={isLoading}
          handleFinish={onSearch}
        />
      </BaseCard>

      <BaseCard className="mt-10px">
        <BaseTable
          isLoading={isLoading}
          isCreate={pagePermission.create}
          columns={columns}
          dataSource={tableData}
          getPage={getPage}
          onCreate={onCreate}
        />
        <BasePagination
          disabled={isLoading}
          current={page}
          pageSize={pageSize}
          total={total}
          onChange={onChangePagination}
        />
      </BaseCard>

      <BaseModal
        title={ADD_TITLE(t)}
        open={isCreateOpen}
        confirmLoading={isCreateLoading}
        onOk={createSubmit}
        onCancel={closeCreate}
      >
        <BaseForm
          form={form}
          ref={createFormRef}
          list={createList(t)}
          labelCol={{ span: 5 }}
          handleFinish={handleCreate}
        />
      </BaseModal>
    </BaseContent>
  );
}

export default Page;
```

- [ ] **Step 3: Commit**

```bash
cd D:/case/gym-admin/south-admin-react
git add src/pages/gym/booking/
git commit -m "feat: add booking management page"
```

---

## Task 12: i18n Translations

**Files:**
- Modify: `src/locales/zh/gym.json` (or add keys to existing namespace)
- Modify: `src/locales/en/gym.json`

**Interfaces:**
- Consumes: t() keys used in all model.ts files above
- Produces: Translation files for Chinese and English

- [ ] **Step 1: Create Chinese translations**

Check the existing locale file structure first:
```bash
ls src/locales/zh/
```

If there's a pattern like individual JSON files per namespace, create `src/locales/zh/gym.json`:

```json
{
  "courseType": "课程类型",
  "courseTypeName": "类型名称",
  "courseName": "课程名称",
  "courseType": "课程类型",
  "location": "地点",
  "locationName": "地点名称",
  "address": "地址",
  "capacity": "容量",
  "instructor": "教练",
  "description": "描述",
  "sortOrder": "排序",
  "status": "状态",
  "statusOpen": "开放预约",
  "statusFull": "已满",
  "statusCancelled": "已取消",
  "statusEnded": "已结束",
  "isRecurring": "周期课程",
  "startDate": "开始日期",
  "startTime": "开始时间",
  "endTime": "结束时间",
  "sessionDate": "上课日期",
  "bookedCount": "已预约",
  "viewSessions": "查看课次",
  "sessionManagement": "课次管理",
  "userName": "用户名",
  "userId": "用户ID",
  "sessionId": "课次ID",
  "remark": "备注",
  "bookingConfirmed": "已预约",
  "bookingCancelled": "已取消",
  "bookingCompleted": "已完成",
  "cancelBooking": "取消预约"
}
```

- [ ] **Step 2: Create English translations**

```json
{
  "courseType": "Course Type",
  "courseTypeName": "Type Name",
  "courseName": "Course Name",
  "location": "Location",
  "locationName": "Location Name",
  "address": "Address",
  "capacity": "Capacity",
  "instructor": "Instructor",
  "description": "Description",
  "sortOrder": "Sort Order",
  "status": "Status",
  "statusOpen": "Open",
  "statusFull": "Full",
  "statusCancelled": "Cancelled",
  "statusEnded": "Ended",
  "isRecurring": "Recurring",
  "startDate": "Start Date",
  "startTime": "Start Time",
  "endTime": "End Time",
  "sessionDate": "Session Date",
  "bookedCount": "Booked",
  "viewSessions": "View Sessions",
  "sessionManagement": "Session Management",
  "userName": "Username",
  "userId": "User ID",
  "sessionId": "Session ID",
  "remark": "Remark",
  "bookingConfirmed": "Confirmed",
  "bookingCancelled": "Cancelled",
  "bookingCompleted": "Completed",
  "cancelBooking": "Cancel Booking"
}
```

- [ ] **Step 3: Register locale namespace**

Check if the project auto-discovers locale files or requires explicit registration. If there's a central i18n config file that lists namespaces, add `'gym'` to it.

- [ ] **Step 4: Commit**

```bash
cd D:/case/gym-admin/south-admin-react
git add src/locales/
git commit -m "feat: add i18n translations for gym module"
```

---

## Task 13: Menu & Permission Seed Data

**Files:**
- Modify: Backend `init.sql` or create a new SQL migration

**Interfaces:**
- Consumes: Menu and Permission table structures from existing system
- Produces: Menu entries for navigation + Permission entries for access control

- [ ] **Step 1: Create SQL seed data**

Add to `init.sql` or run separately:

```sql
-- Course Type Management Menu
INSERT INTO sys_menu (label, label_en, icon, type, router, `order`, state, parent_id, permission_id, is_deleted, create_at, update_at)
VALUES ('课程类型', 'Course Type', 'mdi:dumbbell', 2, '/gym/course-type', 1, 1, NULL, NULL, 0, NOW(), NOW());

SET @courseTypeMenuId = LAST_INSERT_ID();

-- Permissions for course type
INSERT INTO sys_permission (name, description, is_deleted, create_at, update_at) VALUES
('/gym/course-type', '课程类型-查看', 0, NOW(), NOW()),
('/gym/course-type/create', '课程类型-新增', 0, NOW(), NOW()),
('/gym/course-type/update', '课程类型-编辑', 0, NOW(), NOW()),
('/gym/course-type/delete', '课程类型-删除', 0, NOW(), NOW());

SET @courseTypePermViewId = (SELECT id FROM sys_permission WHERE name = '/gym/course-type' AND is_deleted = 0 LIMIT 1);
SET @courseTypePermCreateId = (SELECT id FROM sys_permission WHERE name = '/gym/course-type/create' AND is_deleted = 0 LIMIT 1);
SET @courseTypePermUpdateId = (SELECT id FROM sys_permission WHERE name = '/gym/course-type/update' AND is_deleted = 0 LIMIT 1);
SET @courseTypePermDeleteId = (SELECT id FROM sys_permission WHERE name = '/gym/course-type/delete' AND is_deleted = 0 LIMIT 1);

UPDATE sys_menu SET permission_id = @courseTypePermViewId WHERE id = @courseTypeMenuId;

-- Location Management Menu
INSERT INTO sys_menu (label, label_en, icon, type, router, `order`, state, parent_id, permission_id, is_deleted, create_at, update_at)
VALUES ('课程地点', 'Location', 'mdi:map-marker', 2, '/gym/location', 2, 1, NULL, NULL, 0, NOW(), NOW());

SET @locationMenuId = LAST_INSERT_ID();

INSERT INTO sys_permission (name, description, is_deleted, create_at, update_at) VALUES
('/gym/location', '课程地点-查看', 0, NOW(), NOW()),
('/gym/location/create', '课程地点-新增', 0, NOW(), NOW()),
('/gym/location/update', '课程地点-编辑', 0, NOW(), NOW()),
('/gym/location/delete', '课程地点-删除', 0, NOW(), NOW());

SET @locationPermViewId = (SELECT id FROM sys_permission WHERE name = '/gym/location' AND is_deleted = 0 LIMIT 1);
UPDATE sys_menu SET permission_id = @locationPermViewId WHERE id = @locationMenuId;

-- Course Management Menu
INSERT INTO sys_menu (label, label_en, icon, type, router, `order`, state, parent_id, permission_id, is_deleted, create_at, update_at)
VALUES ('课程管理', 'Courses', 'mdi:school', 2, '/gym/course', 3, 1, NULL, NULL, 0, NOW(), NOW());

SET @courseMenuId = LAST_INSERT_ID();

INSERT INTO sys_permission (name, description, is_deleted, create_at, update_at) VALUES
('/gym/course', '课程管理-查看', 0, NOW(), NOW()),
('/gym/course/create', '课程管理-新增', 0, NOW(), NOW()),
('/gym/course/update', '课程管理-编辑', 0, NOW(), NOW()),
('/gym/course/delete', '课程管理-删除', 0, NOW(), NOW());

SET @coursePermViewId = (SELECT id FROM sys_permission WHERE name = '/gym/course' AND is_deleted = 0 LIMIT 1);
UPDATE sys_menu SET permission_id = @coursePermViewId WHERE id = @courseMenuId;

-- Booking Management Menu
INSERT INTO sys_menu (label, label_en, icon, type, router, `order`, state, parent_id, permission_id, is_deleted, create_at, update_at)
VALUES ('预约管理', 'Bookings', 'mdi:calendar-check', 2, '/gym/booking', 4, 1, NULL, NULL, 0, NOW(), NOW());

SET @bookingMenuId = LAST_INSERT_ID();

INSERT INTO sys_permission (name, description, is_deleted, create_at, update_at) VALUES
('/gym/booking', '预约管理-查看', 0, NOW(), NOW()),
('/gym/booking/create', '预约管理-新增', 0, NOW(), NOW()),
('/gym/booking/update', '预约管理-取消', 0, NOW(), NOW()),
('/gym/booking/delete', '预约管理-删除', 0, NOW(), NOW());

SET @bookingPermViewId = (SELECT id FROM sys_permission WHERE name = '/gym/booking' AND is_deleted = 0 LIMIT 1);
UPDATE sys_menu SET permission_id = @bookingPermViewId WHERE id = @bookingMenuId;
```

- [ ] **Step 2: Verify menu and permissions load**

After running the SQL:
1. Login to the system
2. Navigate to the menu — "课程管理" directory should appear with 4 sub-menus
3. Assign permissions to a role and verify page access works

- [ ] **Step 3: Commit**

```bash
cd D:/case/gym-admin/south-admin-nest
git add init.sql
git commit -m "feat: add gym module menu and permission seed data"
```

---

## Verification Checklist

After all tasks are complete:

1. **Backend health check**: `pnpm run start:dev` in backend — no startup errors, all entities sync to MySQL
2. **CRUD CourseType**: Create, list, edit, delete via API
3. **CRUD Location**: Create, list, edit, delete via API
4. **CRUD Course**: Create single course → verify 1 session generated; Create recurring course → verify multiple sessions generated
5. **CRUD Session**: List sessions by courseId, view session detail with bookings
6. **Booking flow**: Create booking → verify bookedCount increments; Try duplicate booking → verify 409 error; Cancel booking → verify bookedCount decrements and session reopens if was full
7. **Frontend**: All 4 pages render correctly, search/filter works, create/edit modals open and submit
8. **Permissions**: Verify 403 page shows when permission is denied
9. **Menu**: Verify navigation menu appears and routes work
