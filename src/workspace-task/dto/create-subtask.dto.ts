import { IsString, IsOptional, IsNotEmpty, MaxLength, IsMongoId } from 'class-validator';

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
  @IsMongoId({ message: 'assigned_to must be a valid MongoDB ID' })
  assigned_to: string;
}
