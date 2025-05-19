import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateNoteRequest {
  @ApiProperty({ example: '' })
  @IsOptional()
  folder_id?: Types.ObjectId;

  @ApiProperty({ example: 'title' })
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'content' })
  @IsOptional()
  content?: string;
}
