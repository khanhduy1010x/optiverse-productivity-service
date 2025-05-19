import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateNoteRequest {
  @ApiProperty({ example: '' })
  @IsOptional()
  folder_id: string;

  @ApiProperty({ example: 'title' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'content' })
  @IsOptional()
  content?: string;
}
