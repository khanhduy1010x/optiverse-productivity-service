import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateTagRequest {
  @ApiProperty({ example: 'Work', description: 'Tag name' })
  @IsNotEmpty({ message: 'Tag name is required' })
  @IsString({ message: 'Tag name must be a string' })
  name: string;

  @ApiProperty({ example: '#3B82F6', description: 'Tag color in hex format' })
  @IsOptional()
  @IsString({ message: 'Tag color must be a string' })
  color?: string;
}