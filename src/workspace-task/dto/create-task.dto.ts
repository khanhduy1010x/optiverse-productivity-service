import { IsString, IsOptional, IsNotEmpty, MaxLength, IsMongoId, ValidateIf } from 'class-validator';

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
}
