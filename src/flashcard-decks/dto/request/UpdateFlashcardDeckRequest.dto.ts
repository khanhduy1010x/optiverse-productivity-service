import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateFlashcardDeckRequest {
  @ApiProperty({ example: 'title' })
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'description' })
  @IsOptional()
  description?: string;
}
