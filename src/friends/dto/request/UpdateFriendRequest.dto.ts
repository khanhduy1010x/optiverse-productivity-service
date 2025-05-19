import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateFriendRequest {
  @ApiProperty({ example: 'accepted' })
  @IsOptional()
  status?: string;
}
