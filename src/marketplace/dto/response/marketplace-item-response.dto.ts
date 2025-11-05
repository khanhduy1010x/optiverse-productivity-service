import { ApiProperty } from '@nestjs/swagger';
import { MarketplaceItemType } from '../../marketplace-item.schema';

export class CreatorInfoDto {
  @ApiProperty({ description: 'ID của người tạo' })
  user_id: string;

  @ApiProperty({ description: 'Email của người tạo' })
  email: string;

  @ApiProperty({ description: 'Tên đầy đủ của người tạo', required: false })
  full_name?: string;

  @ApiProperty({ description: 'Avatar của người tạo', required: false })
  avatar_url?: string;
}

export class RatingStatsDto {
  @ApiProperty({ description: 'Tổng số đánh giá' })
  totalRatings: number;

  @ApiProperty({ description: 'Đánh giá trung bình' })
  averageRating: number;

  @ApiProperty({ description: 'Phân bố đánh giá theo số sao' })
  ratingDistribution: Record<number, number>;
}

export class MarketplaceItemPricingDto {
  @ApiProperty({ description: 'Giá gốc (không có discount)' })
  original_price: number;

  @ApiProperty({ description: 'Phần trăm discount từ membership (0-0.3)', required: true })
  discount_percentage: number;

  @ApiProperty({ description: 'Số tiền được giảm' })
  discount_amount: number;

  @ApiProperty({ description: 'Giá cuối cùng sau discount' })
  final_price: number;

  @ApiProperty({ description: 'Tên membership tier của user' })
  membership_tier?: string;
}

export class MarketplaceItemResponseDto {
  @ApiProperty({ description: 'ID của item' })
  _id: string;

  @ApiProperty({ description: 'ID của người tạo' })
  creator_id: string;

  @ApiProperty({ description: 'Thông tin người tạo', type: CreatorInfoDto, required: false })
  creator_info?: CreatorInfoDto;

  @ApiProperty({ description: 'Tiêu đề sản phẩm' })
  title: string;

  @ApiProperty({ description: 'Mô tả sản phẩm', required: false })
  description?: string;

  @ApiProperty({ description: 'Danh sách hình ảnh', type: [String] })
  images: string[];

  @ApiProperty({ description: 'Giá bán' })
  price: number;

  @ApiProperty({ description: 'Thông tin giá và discount (nếu user có membership)', type: MarketplaceItemPricingDto, required: false })
  pricing?: MarketplaceItemPricingDto;

  @ApiProperty({ description: 'Loại sản phẩm', enum: MarketplaceItemType })
  type: MarketplaceItemType;
  
  @ApiProperty({ description: 'ID của loại sản phẩm (ID của flashcard, frame, ...)', required: false })
  type_id?: string;

  @ApiProperty({ description: 'Number of times this item has been purchased', default: 0 })
  purchase_count?: number;

  @ApiProperty({ description: 'Danh sách ID của các đánh giá', type: [String], required: false })
  rate_id?: string[];

  @ApiProperty({ description: 'Thống kê đánh giá', type: RatingStatsDto, required: false })
  rating_stats?: RatingStatsDto;

  @ApiProperty({ description: 'Đã mua item này hay chưa', default: false })
  is_purchased?: boolean;
}