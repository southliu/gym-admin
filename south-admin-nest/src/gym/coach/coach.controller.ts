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
