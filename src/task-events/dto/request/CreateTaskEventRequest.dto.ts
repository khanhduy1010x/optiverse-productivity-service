import { IsNotEmpty, IsOptional, IsEnum, IsString, IsBoolean, IsArray, IsNumber } from 'class-validator';
import { Types } from 'mongoose';

export class CreateTaskEventRequest {
  @IsOptional()
  task_id?: string;

  @IsNotEmpty()
  user_id: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  start_time: Date;

  @IsOptional()
  end_time?: Date;

  @IsOptional()
  @IsBoolean()
  all_day?: boolean;

  @IsEnum(['none', 'daily', 'weekly', 'monthly', 'yearly', 'weekday', 'custom'])
  repeat_type: string;

  @IsOptional()
  @IsNumber()
  repeat_interval?: number;

  @IsOptional()
  @IsArray()
  repeat_days?: number[];

  @IsOptional()
  @IsEnum(['never', 'on', 'after'])
  repeat_end_type?: string;

  @IsOptional()
  repeat_end_date?: Date;

  @IsOptional()
  @IsNumber()
  repeat_occurrences?: number;

  @IsOptional()
  @IsNumber()
  repeat_frequency?: number;

  @IsOptional()
  @IsEnum(['day', 'week', 'month', 'year'])
  repeat_unit?: string;

  @IsOptional()
  @IsArray()
  exclusion_dates?: Date[];

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsArray()
  guests?: string[];

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  parent_event_id?: string;
}
