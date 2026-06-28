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
