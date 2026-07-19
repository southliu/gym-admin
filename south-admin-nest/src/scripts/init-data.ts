import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { User } from '../system/entities/user.entity';
import { Role } from '../system/entities/role.entity';
import { Permission } from '../system/entities/permission.entity';
import { Menu } from '../system/entities/menu.entity';
import { Article } from '../contents/entities/article.entity';
import { Log } from '../log/entities/log.entity';
import { CourseType } from '../gym/entities/course-type.entity';
import { Location } from '../gym/entities/location.entity';
import { Course } from '../gym/entities/course.entity';
import { CourseSession } from '../gym/entities/course-session.entity';
import { Booking } from '../gym/entities/booking.entity';
import { Coach } from '../gym/entities/coach.entity';
import { CoachScheduleTemplate } from '../gym/entities/coach-schedule-template.entity';
import { CoachScheduleOverride } from '../gym/entities/coach-schedule-override.entity';
import { CoachCourse } from '../gym/entities/coach-course.entity';

function loadEnv(): Record<string, string> {
  const envPath = path.join(__dirname, '../../.env');
  const env: Record<string, string> = {};
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    env[key] = value;
  }
  return env;
}

async function initDatabase() {
  const env = loadEnv();

  const dataSource = new DataSource({
    type: 'mysql',
    host: env.DB_HOST || 'localhost',
    port: parseInt(env.DB_PORT) || 3306,
    username: env.DB_USERNAME || 'root',
    password: env.DB_PASSWORD || '',
    database: env.DB_DATABASE || 'south_admin',
    entities: [User, Role, Permission, Menu, Article, Log, CourseType, Location, Course, CourseSession, Booking, Coach, CoachScheduleTemplate, CoachScheduleOverride, CoachCourse],
    synchronize: true,
    logging: false,
    multipleStatements: true,
  });

  try {
    await dataSource.initialize();
    console.log('Database connected successfully');

    const sqlFilePath = path.join(__dirname, '../../init.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

    console.log('Executing init.sql...');
    await dataSource.query(sqlContent);
    console.log('init.sql executed successfully!');

    const result = await dataSource.query(`
      SELECT
        (SELECT COUNT(*) FROM sys_user) as users,
        (SELECT COUNT(*) FROM sys_role) as roles,
        (SELECT COUNT(*) FROM sys_permission) as permissions,
        (SELECT COUNT(*) FROM sys_menu) as menus,
        (SELECT COUNT(*) FROM sys_role_menu) as role_menus,
        (SELECT COUNT(*) FROM gym_course_type) as course_types,
        (SELECT COUNT(*) FROM gym_location) as locations,
        (SELECT COUNT(*) FROM gym_course) as courses,
        (SELECT COUNT(*) FROM gym_course_session) as sessions,
        (SELECT COUNT(*) FROM gym_booking) as bookings,
        (SELECT COUNT(*) FROM gym_coach) as coaches,
        (SELECT COUNT(*) FROM gym_coach_schedule_template) as schedule_templates,
        (SELECT COUNT(*) FROM gym_coach_schedule_override) as schedule_overrides,
        (SELECT COUNT(*) FROM gym_coach_course) as coach_courses
    `);

    console.log('\n=== Data Summary ===');
    console.log(`Users:            ${result[0].users}`);
    console.log(`Roles:            ${result[0].roles}`);
    console.log(`Permissions:      ${result[0].permissions}`);
    console.log(`Menus:            ${result[0].menus}`);
    console.log(`Role-Menu:        ${result[0].role_menus}`);
    console.log(`Course Types:     ${result[0].course_types}`);
    console.log(`Locations:        ${result[0].locations}`);
    console.log(`Courses:          ${result[0].courses}`);
    console.log(`Course Sessions:  ${result[0].sessions}`);
    console.log(`Bookings:         ${result[0].bookings}`);
    console.log(`Coaches:          ${result[0].coaches}`);
    console.log(`Schedule Templates:  ${result[0].schedule_templates}`);
    console.log(`Schedule Overrides:  ${result[0].schedule_overrides}`);
    console.log(`Coach Courses:    ${result[0].coach_courses}`);

    await dataSource.destroy();
  } catch (error: any) {
    console.error('Error:', error.message);
    await dataSource.destroy();
    process.exit(1);
  }
}

initDatabase();
