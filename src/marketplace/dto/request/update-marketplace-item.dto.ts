import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { MarketplaceItemType } from '../../marketplace-item.schema';

export class UpdateMarketplaceItemDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  images?: Express.Multer.File[]; // File uploaded from multipart

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return parseInt(value, 10);
    }
    return value;
  })
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsEnum(MarketplaceItemType)
  type?: MarketplaceItemType;
  
  @IsOptional()
  @IsString()
  type_id?: string;
}