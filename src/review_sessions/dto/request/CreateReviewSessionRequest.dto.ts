import { IsNotEmpty, IsNumber, Min, Max } from 'class-validator';
import { Types } from 'mongoose';

export class CreateReviewSessionRequest {
  @IsNotEmpty()
  flashcard_id: Types.ObjectId;

  @IsNotEmpty()
  user_id: Types.ObjectId;

  @IsNotEmpty()
  last_review: Date;

  @IsNotEmpty()
  next_review: Date;

  @IsNumber()
  interval: number;

  @IsNumber()
  ease_factor: number;

  @IsNumber()
  repetition_count: number;

  @IsNumber()
  @Min(0)
  @Max(5)
  quality: number;
}
