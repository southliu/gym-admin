import { Controller, Get, Put, Body, Query, Param } from '@nestjs/common';
import { SessionService } from './session.service';
import { UpdateSessionDto } from '../dto/session.dto';

@Controller('gym/session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get('page')
  async page(@Query() dto: any) {
    return await this.sessionService.page(dto);
  }

  @Get('detail')
  async detail(@Query('id') id: number) {
    return await this.sessionService.detail(id);
  }

  @Put('updateStatus/:id')
  async updateStatus(@Param('id') id: number, @Body('status') status: number) {
    return await this.sessionService.updateStatus(id, status);
  }

  @Put('/:id')
  async update(@Param('id') id: number, @Body() dto: UpdateSessionDto) {
    return await this.sessionService.update(id, dto);
  }
}
