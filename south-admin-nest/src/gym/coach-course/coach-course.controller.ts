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
