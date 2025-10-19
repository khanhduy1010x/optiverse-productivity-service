import { IsString, IsIn, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UnbanUserDto {
  @ApiProperty({
    description: 'User ID to unban',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description:
      'Action to take: "remove" to delete user from workspace, "unban" to reactivate user',
    example: 'unban',
    enum: ['remove', 'unban'],
  })
  @IsString()
  @IsIn(['remove', 'unban'])
  action: 'remove' | 'unban';
}
