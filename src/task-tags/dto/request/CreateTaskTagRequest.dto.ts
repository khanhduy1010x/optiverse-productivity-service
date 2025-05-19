import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class CreateTaskTagRequest {
  @ApiProperty({ example: '' })
  @IsNotEmpty()
  task_id: string;

  @ApiProperty({ example: '' })
  @IsNotEmpty()
  tag_id: string;
}
