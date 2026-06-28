import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCoachCourseDto {
  @Type(() => Number)
  @IsInt()
  coachId: number;

  @Type(() => Number)
  @IsInt()
  courseId: number;
}
