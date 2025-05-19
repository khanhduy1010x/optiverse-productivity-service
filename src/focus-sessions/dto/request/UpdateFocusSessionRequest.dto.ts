import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateFocusSessionRequest {
  @ApiProperty({ example: '2024-12-12' })
  @IsOptional()
  start_time?: Date;

  @ApiProperty({ example: '2024-12-12' })
  @IsOptional()
  end_time?: Date;
}
