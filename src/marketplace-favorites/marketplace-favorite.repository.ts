import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MarketplaceFavorite } from './marketplace-favorite.schema';

@Injectable()
export class MarketplaceFavoriteRepository {
  constructor(
    @InjectModel(MarketplaceFavorite.name)
    private marketplaceFavoriteModel: Model<MarketplaceFavorite>,
  ) {}

  /**
   * Thêm item vào favorites
   */
  async create(userId: string, marketplaceItemId: string): Promise<MarketplaceFavorite> {
    const favorite = new this.marketplaceFavoriteModel({
      user_id: new Types.ObjectId(userId),
      marketplace_item_id: new Types.ObjectId(marketplaceItemId),
    });
    return favorite.save();
  }

  /**
   * Xóa item khỏi favorites
   */
  async remove(userId: string, marketplaceItemId: string): Promise<boolean> {
    const result = await this.marketplaceFavoriteModel.deleteOne({
      user_id: new Types.ObjectId(userId),
      marketplace_item_id: new Types.ObjectId(marketplaceItemId),
    });
    return result.deletedCount > 0;
  }

  /**
   * Kiểm tra item đã được favorite chưa
   */
  async isFavorited(userId: string, marketplaceItemId: string): Promise<boolean> {
    const favorite = await this.marketplaceFavoriteModel.findOne({
      user_id: new Types.ObjectId(userId),
      marketplace_item_id: new Types.ObjectId(marketplaceItemId),
    });
    return !!favorite;
  }

  /**
   * Lấy danh sách favorites của user (có phân trang)
   */
  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ favorites: MarketplaceFavorite[]; total: number }> {
    const skip = (page - 1) * limit;
    
    const [favorites, total] = await Promise.all([
      this.marketplaceFavoriteModel
        .find({ user_id: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.marketplaceFavoriteModel.countDocuments({ user_id: new Types.ObjectId(userId) }),
    ]);

    return { favorites, total };
  }

  /**
   * Đếm số lượng favorites của một marketplace item
   */
  async countByMarketplaceItem(marketplaceItemId: string): Promise<number> {
    return this.marketplaceFavoriteModel.countDocuments({
      marketplace_item_id: new Types.ObjectId(marketplaceItemId),
    });
  }

  /**
   * Lấy danh sách marketplace item IDs đã favorite của user
   */
  async getFavoriteItemIds(userId: string): Promise<string[]> {
    const favorites = await this.marketplaceFavoriteModel
      .find({ user_id: new Types.ObjectId(userId) })
      .select('marketplace_item_id')
      .exec();
    
    return favorites.map(f => f.marketplace_item_id.toString());
  }
}
