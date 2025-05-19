import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateNoteFolderRequest {
  @ApiProperty({ example: '' })
  @IsOptional()
  parent_folder_id?: string;

  @ApiProperty({ example: 'name' })
  @IsOptional()
  name?: string;
}
