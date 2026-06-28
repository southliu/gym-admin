import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @Type(() => Number)
  @IsInt()
  sessionId: number;

  @Type(() => Number)
  @IsInt()
  userId: number;

  @IsOptional()
  @IsString()
  remark?: string;
}
