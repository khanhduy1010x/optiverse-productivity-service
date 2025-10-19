import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class JoinWorkspaceWithPasswordDto {
  @ApiProperty({ description: 'Workspace invite code' })
  @IsNotEmpty()
  @IsString()
  invite_code: string;

  @ApiProperty({ description: 'Workspace password' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
