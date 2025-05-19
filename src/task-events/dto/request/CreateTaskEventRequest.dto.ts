import { IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { Types } from 'mongoose';

export class CreateTaskEventRequest {
  @IsNotEmpty()
  task_id: string;

  @IsNotEmpty()
  start_time: Date;

  @IsOptional()
  end_time?: Date;

  @IsEnum(['none', 'daily', 'weekly', 'monthly', 'yearly'])
  repeat_type: string;

  @IsOptional()
  repeat_interval?: number;

  @IsOptional()
  repeat_end_date?: Date;
}
