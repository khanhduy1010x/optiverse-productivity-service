import { IsObject, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PurchaseDiscountDetailsDto {
  @ApiProperty({ description: 'Giá gốc' })
  original_price: number;

  @ApiProperty({ description: 'Phần trăm discount' })
  discount_percentage: number;

  @ApiProperty({ description: 'Số tiền được giảm' })
  discount_amount: number;

  @ApiProperty({ description: 'Giá cuối cùng mà buyer phải trả' })
  final_price: number;

  @ApiProperty({ description: 'Số điểm còn lại của buyer sau khi mua' })
  remainingPoints?: number;

  @ApiProperty({ description: 'Tên membership tier của buyer' })
  membership_tier?: string;
}

export class PurchaseResponseDto {
  @ApiProperty({ description: 'Thông điệp thành công' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'ID của marketplace item' })
  @IsString()
  marketplace_item_id: string;

  @ApiProperty({ description: 'ID của flashcard/item được mua' })
  @IsString()
  purchased_flashcard_id: string;

  @ApiProperty({ description: 'ID của deck được mua' })
  @IsString()
  purchased_deck_id: string;

  @ApiProperty({ description: 'Chi tiết về discount', type: PurchaseDiscountDetailsDto })
  @IsOptional()
  @IsObject()
  discount_details?: PurchaseDiscountDetailsDto;

  @ApiProperty({ description: 'Các thông tin khác' })
  @IsOptional()
  @IsObject()
  details?: Record<string, any>;
}
