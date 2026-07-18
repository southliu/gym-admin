import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { Role } from '../../system/entities/role.entity';
import { Menu } from '../../system/entities/menu.entity';
import { User } from '../../system/entities/user.entity';
import { Coach } from '../../gym/entities/coach.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Menu, User, Coach])],
  providers: [SeedService],
})
export class SeedModule {}
