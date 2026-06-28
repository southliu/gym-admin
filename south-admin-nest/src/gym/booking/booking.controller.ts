import { Controller, Get, Post, Put, Delete, Body, Query, Param } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from '../dto/booking.dto';

@Controller('gym/booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get('page')
  async page(@Query() dto: any) {
    return await this.bookingService.page(dto);
  }

  @Post('create')
  async create(@Body() dto: CreateBookingDto) {
    return await this.bookingService.create(dto);
  }

  @Put('cancel/:id')
  async cancel(@Param('id') id: number) {
    await this.bookingService.cancel(id);
    return { message: '取消成功' };
  }

  @Delete('/:id')
  async delete(@Param('id') id: number) {
    await this.bookingService.delete(id);
    return { message: '删除成功' };
  }
}
