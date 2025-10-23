import { IsNotEmpty, IsOptional, IsEnum, IsString, IsBoolean, IsArray, IsNumber, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';

export class CreateTaskEventRequest {
  @IsOptional()
  task_id?: string;

  @IsNotEmpty({ message: 'User ID is required' })
  user_id: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Event title must be a string' })
  @MaxLength(50, { message: 'Event title must be at most 50 characters' })
  @Matches(/\S/, { message: 'Event title cannot be only whitespace' })
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  description?: string;

  @IsOptional()
  start_time?: string;

  @IsOptional()
  end_time?: string;

  @IsOptional()
  @IsBoolean()
  all_day?: boolean;

  @IsOptional()
  @IsEnum(['none', 'daily', 'weekly', 'monthly', 'yearly', 'weekday', 'custom'])
  repeat_type?: string;

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
