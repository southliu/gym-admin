import { IsOptional, IsInt, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSessionDto {
  @IsOptional()
  @IsDateString()
  sessionDate?: string;

  @IsOptional()
  startTime?: string;

  @IsOptional()
  endTime?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  capacity?: number;
}
