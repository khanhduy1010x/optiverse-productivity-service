import { IsString, IsNumber, Min, Max, IsOptional, IsMongoId } from 'class-validator';

export class CreateRatingRequest {
  @IsMongoId()
  marketplace_id: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
