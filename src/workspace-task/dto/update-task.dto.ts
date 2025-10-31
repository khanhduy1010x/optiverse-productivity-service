import { IsString, IsOptional, MaxLength, IsEnum, IsMongoId, IsISO8601, IsArray } from 'class-validator';

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

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true, message: 'Each member ID in assigned_to_list must be a valid MongoDB ID' })
  assigned_to_list?: string[];

  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'end_time must be a valid ISO 8601 date' })
  end_time?: string;
}
