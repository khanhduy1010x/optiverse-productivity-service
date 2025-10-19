import { IsArray, IsOptional, IsString } from 'class-validator';

export class InviteMultipleUsersDto {
  @IsArray()
  @IsString({ each: true })
  userIds: string[];

  @IsOptional()
  @IsString()
  message?: string;
}
