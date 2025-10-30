import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { MarketplaceItemType } from '../../marketplace-item.schema';

export class CreateMarketplaceItemDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsOptional()
  images?: Express.Multer.File[]; // File uploaded from multipart

  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return parseInt(value, 10);
    }
    return value;
  })
  @IsNumber()
  @Min(0)
  price: number;

  @IsNotEmpty()
  @IsEnum(MarketplaceItemType)
  type: MarketplaceItemType;
  
  @IsOptional()
  @IsString()
  type_id?: string;
}