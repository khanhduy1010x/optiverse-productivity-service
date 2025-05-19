import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateTaskRequest {
  @ApiProperty({ example: 'task title' })
  title: string;

  @ApiProperty({ example: 'task description' })
  description?: string;

  @ApiProperty({ example: 'pending' })
  status: string;

  @ApiProperty({ example: 'low' })
  priority?: string;
}
