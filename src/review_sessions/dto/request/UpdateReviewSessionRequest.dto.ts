import { IsOptional, IsNumber, Min, Max } from 'class-validator';

export class UpdateReviewSessionRequest {
  @IsOptional()
  last_review?: Date;

  @IsOptional()
  next_review?: Date;

  @IsOptional()
  @IsNumber()
  interval?: number;

  @IsOptional()
  @IsNumber()
  ease_factor?: number;

  @IsOptional()
  @IsNumber()
  repetition_count?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  quality?: number;
}
