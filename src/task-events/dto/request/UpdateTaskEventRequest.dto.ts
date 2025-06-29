import { IsOptional, IsEnum, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateTaskEventRequest {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  start_time?: Date;

  @IsOptional()
  end_time?: Date;

  @IsOptional()
  @IsEnum(['none', 'daily', 'weekly', 'monthly', 'yearly'])
  repeat_type?: string;

  @IsOptional()
  repeat_interval?: number;

  @IsOptional()
  repeat_end_date?: Date;
}
