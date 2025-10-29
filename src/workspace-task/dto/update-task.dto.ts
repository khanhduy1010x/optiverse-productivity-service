import { IsString, IsOptional, MaxLength, IsEnum, IsMongoId } from 'class-validator';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsEnum(['to-do', 'in-progress', 'done'])
  status?: string;

  @IsOptional()
  @IsMongoId({ message: 'assigned_to must be a valid MongoDB ID' })
  assigned_to?: string;
}
