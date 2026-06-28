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
