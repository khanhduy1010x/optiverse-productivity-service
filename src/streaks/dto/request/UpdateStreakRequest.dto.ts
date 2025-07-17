import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber } from 'class-validator';

export class UpdateStreakRequest {
  @ApiProperty({ example: 0 })
  @IsOptional()
  @IsNumber()
  loginStreak?: number;

  @ApiProperty({ example: '2023-01-01' })
  @IsOptional()
  lastLoginDate?: Date;

  @ApiProperty({ example: 0 })
  @IsOptional()
  @IsNumber()
  taskStreak?: number;

  @ApiProperty({ example: '2023-01-01' })
  @IsOptional()
  lastTaskDate?: Date;

  @ApiProperty({ example: 0 })
  @IsOptional()
  @IsNumber()
  flashcardStreak?: number;

  @ApiProperty({ example: '2023-01-01' })
  @IsOptional()
  lastFlashcardDate?: Date;
} 