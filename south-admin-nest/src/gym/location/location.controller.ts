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
