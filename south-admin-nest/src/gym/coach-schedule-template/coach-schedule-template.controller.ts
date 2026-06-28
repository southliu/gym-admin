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
