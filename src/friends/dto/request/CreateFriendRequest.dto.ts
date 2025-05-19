import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class CreateFriendRequest {
  @ApiProperty({ example: '' })
  @IsNotEmpty()
  user_id: Types.ObjectId;

  @ApiProperty({ example: '' })
  @IsNotEmpty()
  friend_id: Types.ObjectId;
}
