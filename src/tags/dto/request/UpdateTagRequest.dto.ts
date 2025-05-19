import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateTagRequest {
  @ApiProperty({ example: 'name' })
  name?: string;

  @ApiProperty({ example: 'color' })
  color?: string;
}
