import { IsNotEmpty, IsNumber, IsUUID, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ReviewRequestDto {
  @IsNotEmpty()
  @IsString()
  flashcard_id: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(5)
  quality: number;
}
