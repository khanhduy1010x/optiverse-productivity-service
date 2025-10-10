import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, Matches, IsEnum, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateTaskRequest {
  @ApiProperty({ example: 'task title' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(50, { message: 'Title must be at most 50 characters' })
  @Matches(/\S/, { message: 'Title cannot be only whitespace' })
  title?: string;

  @ApiPropertyOptional({ example: 'task description' })
  @IsOptional()
  @IsString()
  @MaxLength(150, { message: 'Description must be at most 150 characters' })
  description?: string;

  @ApiProperty({ example: 'pending' })
  @IsOptional()
  @IsEnum(['pending', 'completed', 'overdue'], { message: 'Invalid status value' })
  status?: string;

  @ApiProperty({ example: 'low' })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high'], { message: 'Invalid priority value' })
  priority?: string;

  @ApiPropertyOptional({ example: '2024-12-12T08:00:00.000Z' })
  @IsOptional()
  @Transform(({ value }) => (value instanceof Date ? value.toISOString() : value))
  @IsDateString({}, { message: 'Start time must be a valid ISO date' })
  start_time?: string;

  @ApiPropertyOptional({ example: '2024-12-12T10:00:00.000Z' })
  @IsOptional()
  @Transform(({ value }) => (value instanceof Date ? value.toISOString() : value))
  @IsDateString({}, { message: 'End time must be a valid ISO date' })
  end_time?: string;
}
