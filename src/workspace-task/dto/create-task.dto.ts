import { IsString, IsOptional, IsNotEmpty, MaxLength, IsMongoId, ValidateIf, IsISO8601, IsArray } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @ValidateIf((obj) => obj.assigned_to !== undefined && obj.assigned_to !== null && obj.assigned_to !== '')
  @IsMongoId({ message: 'assigned_to must be a valid MongoDB ID' })
  assigned_to?: string | null;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true, message: 'Each member ID in assigned_to_list must be a valid MongoDB ID' })
  assigned_to_list?: string[];

  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'end_time must be a valid ISO 8601 date' })
  end_time?: string;
}
