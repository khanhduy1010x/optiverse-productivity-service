import { IsObject, IsOptional, IsString } from 'class-validator';

export class PurchaseResponseDto {
  @IsString()
  message: string;

  @IsString()
  marketplace_item_id: string;

  @IsString()
  purchased_flashcard_id: string;

  @IsString()
  purchased_deck_id: string;

  @IsOptional()
  @IsString()
  source_marketplace_item_id?: string;

  @IsOptional()
  @IsObject()
  details?: Record<string, any>;
}
