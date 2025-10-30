import { IsNotEmpty, IsString } from 'class-validator';

export class PurchaseMarketplaceItemDto {
  @IsNotEmpty()
  @IsString()
  marketplace_item_id: string;
}
