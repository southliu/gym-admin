import { IsInt, IsString, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCoachScheduleTemplateDto {
  @Type(() => Number)
  @IsInt()
  coachId: number;

  @Type(() => Number)
  @IsInt()
  dayOfWeek: number;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;
}

export class UpdateCoachScheduleTemplateDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  dayOfWeek?: number;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;
}

export class BatchGenerateDto {
  @Type(() => Number)
  @IsInt()
  coachId: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
