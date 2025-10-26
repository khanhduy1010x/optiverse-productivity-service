import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateSubtaskDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsNotEmpty()
  @IsString()
  assigned_to: string;
}
