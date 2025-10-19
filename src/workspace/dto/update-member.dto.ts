import { IsEnum } from 'class-validator';

export class UpdateMemberRoleDto {
  @IsEnum(['admin', 'user'])
  role: string;
}

export class UpdateMemberStatusDto {
  @IsEnum(['active', 'banned'])
  status: string;
}
