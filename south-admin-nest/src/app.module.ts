import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { SystemModule } from './system/system.module';
import { ContentsModule } from './contents/contents.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { LogModule } from './log/log.module';
import { GymModule } from './gym/gym.module';
import { User } from './system/entities/user.entity';
import { Role } from './system/entities/role.entity';
import { Permission } from './system/entities/permission.entity';
import { Menu } from './system/entities/menu.entity';
import { Article } from './contents/entities/article.entity';
import { Log } from './log/entities/log.entity';
import { CourseType } from './gym/entities/course-type.entity';
import { Location } from './gym/entities/location.entity';
import { Course } from './gym/entities/course.entity';
import { CourseSession } from './gym/entities/course-session.entity';
import { Booking } from './gym/entities/booking.entity';
import { Coach } from './gym/entities/coach.entity';
import { CoachScheduleTemplate } from './gym/entities/coach-schedule-template.entity';
import { CoachScheduleOverride } from './gym/entities/coach-schedule-override.entity';
import { CoachCourse } from './gym/entities/coach-course.entity';
import { HttpExceptionFilter as CustomHttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { LogService } from './log/log.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [User, Role, Permission, Menu, Article, Log, CourseType, Location, Course, CourseSession, Booking, Coach, CoachScheduleTemplate, CoachScheduleOverride, CoachCourse],
        synchronize: true,
        logging: true,
        timezone: '+08:00',
        charset: 'utf8mb4',
      }),
      inject: [ConfigService],
    }),
    CommonModule,
    SystemModule,
    ContentsModule,
    DashboardModule,
    LogModule,
    GymModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useFactory: (logService: LogService) => {
        return new CustomHttpExceptionFilter(logService);
      },
      inject: [LogService],
    },
    {
      provide: APP_INTERCEPTOR,
      useFactory: (logService: LogService) => {
        return new LoggingInterceptor(logService);
      },
      inject: [LogService],
    },
  ],
})
export class AppModule {}
