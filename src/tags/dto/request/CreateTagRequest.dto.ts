import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateTagRequest {
  @ApiProperty({ example: 'name' })
  name: string;

  @ApiProperty({ example: 'color' })
  color?: string;
}
