import { IsString, IsArray, IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMemberPermissionsDto {
  @ApiProperty({
    description: 'User ID whose permissions to update',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'List of permissions to assign to the user',
    example: ['RENAME_WORKSPACE', 'EDIT_DESCRIPTION'],
    enum: [
      'RENAME_WORKSPACE',
      'EDIT_DESCRIPTION',
      'MANAGE_PASSWORD',
      'MANAGE_MEMBERS',
      'ACCEPT_MEMBER',
    ],
    isArray: true,
  })
  @IsArray()
  @IsString({ each: true })
  @IsIn(
    [
      'RENAME_WORKSPACE',
      'EDIT_DESCRIPTION',
      'MANAGE_PASSWORD',
      'MANAGE_MEMBERS',
      'ACCEPT_MEMBER',
    ],
    { each: true },
  )
  permissions: string[];
}
