import { IsString, IsIn, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMemberRoleDto {
  @ApiProperty({
    description: 'User ID whose role to update',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'New role for the user',
    example: 'admin',
    enum: ['admin', 'user'],
  })
  @IsString()
  @IsIn(['admin', 'user'])
  role: 'admin' | 'user';
}
