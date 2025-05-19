import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateTaskRequest {
  @ApiProperty({ example: 'task title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'task description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'pending' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ example: 'low' })
  @IsOptional()
  @IsString()
  priority?: string;
}
