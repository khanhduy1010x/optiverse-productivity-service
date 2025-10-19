import { IsString, IsArray, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Permission } from '../permission.service';

export class ManageMemberPermissionsDto {
  @ApiProperty({
    description: 'ID of the user to manage permissions for',
    example: '60f7b1b4b3b3b3b3b3b3b3b3',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Array of permissions to grant to the user',
    example: ['RENAME_WORKSPACE', 'EDIT_DESCRIPTION'],
    enum: Permission,
    isArray: true,
  })
  @IsArray()
  @IsEnum(Permission, { each: true })
  permissions: Permission[];

  @ApiProperty({
    description:
      'Action to perform: grant (add permissions) or revoke (remove permissions) or set (replace all permissions)',
    example: 'set',
    enum: ['grant', 'revoke', 'set'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['grant', 'revoke', 'set'])
  action?: 'grant' | 'revoke' | 'set';
}
