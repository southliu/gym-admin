import { IsString, IsOptional, IsInt, IsBoolean, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCourseDto {
  @IsString()
  name: string;

  @Type(() => Number)
  @IsInt()
  typeId: number;

  @Type(() => Number)
  @IsInt()
  locationId: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  coachId?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsInt()
  capacity: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  repeatRule?: { freq: string; days: number[]; interval: number; endDate: string };

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsString()
  createdUser?: string;
}

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  typeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  locationId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  coachId?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  capacity?: number;

  @IsOptional()
  @IsString()
  updatedUser?: string;
}
