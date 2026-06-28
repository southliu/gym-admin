import { IsInt, IsString, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCoachScheduleOverrideDto {
  @Type(() => Number)
  @IsInt()
  coachId: number;

  @IsDateString()
  overrideDate: string;

  @Type(() => Number)
  @IsInt()
  type: number;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateCoachScheduleOverrideDto {
  @IsOptional()
  @IsDateString()
  overrideDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  type?: number;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
