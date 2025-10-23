import { IsString, IsOptional, MaxLength, IsEnum } from 'class-validator';

export class UpdateSubtaskDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  assigned_to?: string;

  @IsOptional()
  @IsEnum(['to-do', 'in-progress', 'done'])
  status?: string;
}
