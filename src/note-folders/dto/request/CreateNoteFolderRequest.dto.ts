import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateNoteFolderRequest {
  @ApiProperty({ example: '' })
  @IsOptional()
  parent_folder_id?: Types.ObjectId;

  @ApiProperty({ example: 'name' })
  @IsNotEmpty()
  name: string;
}
