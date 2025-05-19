import { IsNotEmpty, IsNumber, IsUUID, Min, Max } from 'class-validator';

export class ReviewRequestDto {
  flashcard_id: string;

  quality: number;
}
