import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateWorkspaceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  password?: string;

  // Optional list of member user IDs to add at creation time
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  memberIds?: string[];
}
