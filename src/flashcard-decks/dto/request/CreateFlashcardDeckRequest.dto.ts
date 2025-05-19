import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateFlashcardDeckRequest {
  @ApiProperty({ example: 'title' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'description' })
  @IsOptional()
  description?: string;
}
