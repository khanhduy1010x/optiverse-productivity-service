import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateFlashcardRequest {
  @ApiProperty({ example: 'front' })
  @IsOptional()
  front?: string;

  @ApiProperty({ example: 'back' })
  @IsOptional()
  back?: string;
}
