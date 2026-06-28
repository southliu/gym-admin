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
