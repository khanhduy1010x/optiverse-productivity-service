import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class CreateFocusSessionRequest {
  @ApiProperty({ example: '2025-03-14T12:49:48.030+00:00', type: String, format: 'date' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  start_time: Date;

  @ApiProperty({ example: '2025-03-14T13:49:48.030+00:00', type: String, format: 'date' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  end_time: Date;
}
