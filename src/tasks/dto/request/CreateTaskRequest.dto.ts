import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, Matches, IsOptional, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTaskRequest {
  @ApiProperty({ example: 'task title' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'Title must not be empty' })
  @IsString({ message: 'Title must be a string' })
  @MaxLength(50, { message: 'Title must be at most 50 characters' })
  @Matches(/\S/, { message: 'Title cannot be only whitespace' })
  title: string;

  @ApiPropertyOptional({ example: 'task description' })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(150, { message: 'Description must be at most 150 characters' })
  description?: string;

  @ApiPropertyOptional({ example: 'pending', enum: ['pending', 'completed', 'overdue'] })
  @IsOptional()
  @IsEnum(['pending', 'completed', 'overdue'], { message: 'Invalid status value' })
  status?: string;

  @ApiPropertyOptional({ example: 'low', enum: ['low', 'medium', 'high'] })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high'], { message: 'Invalid priority value' })
  priority?: string;

  @ApiPropertyOptional({ example: '2024-12-12T08:00:00.000Z' })
  @IsOptional()
  start_time?: string;

  @ApiPropertyOptional({ example: '2024-12-12T10:00:00.000Z' })
  @IsOptional()
  end_time?: string;
}
