import { IsString, IsOptional } from 'class-validator';

export class JoinWorkspaceDto {
  @IsString()
  invite_code: string;

  @IsString()
  @IsOptional()
  message?: string;
}
