import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MarketplaceFollower } from './marketplace-follower.schema';

@Injectable()
export class MarketplaceFollowerRepository {
  constructor(
    @InjectModel(MarketplaceFollower.name)
    private marketplaceFollowerModel: Model<MarketplaceFollower>,
  ) {}

  /**
   * Follow creator
   */
  async follow(followerId: string, creatorId: string): Promise<MarketplaceFollower> {
    const follower = new this.marketplaceFollowerModel({
      follower_id: new Types.ObjectId(followerId),
      creator_id: new Types.ObjectId(creatorId),
    });
    return follower.save();
  }

  /**
   * Unfollow creator
   */
  async unfollow(followerId: string, creatorId: string): Promise<boolean> {
    const result = await this.marketplaceFollowerModel.deleteOne({
      follower_id: new Types.ObjectId(followerId),
      creator_id: new Types.ObjectId(creatorId),
    });
    return result.deletedCount > 0;
  }

  /**
   * Kiểm tra đã follow creator chưa
   */
  async isFollowing(followerId: string, creatorId: string): Promise<boolean> {
    const follower = await this.marketplaceFollowerModel.findOne({
      follower_id: new Types.ObjectId(followerId),
      creator_id: new Types.ObjectId(creatorId),
    });
    return !!follower;
  }

  /**
   * Lấy danh sách creators mà user đang follow
   */
  async getFollowingList(
    followerId: string,
    page: number = 1,
    limit: number = 10,
    search: string = '',
  ): Promise<{ following: MarketplaceFollower[]; total: number }> {
    const skip = (page - 1) * limit;
    
    // Build search filter dựa trên creator full_name
    // Note: Vì chưa enrich data tại repository level, ta filter sau khi lấy dữ liệu từ UserHttpClient
    // Hiện tại chỉ filter đơn giản theo ObjectId nếu cần
    const filter = {
      follower_id: new Types.ObjectId(followerId),
    };

    const [following, total] = await Promise.all([
      this.marketplaceFollowerModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.marketplaceFollowerModel.countDocuments(filter),
    ]);

    return { following, total };
  }

  /**
   * Lấy danh sách followers của creator
   */
  async getFollowers(
    creatorId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ followers: MarketplaceFollower[]; total: number }> {
    const skip = (page - 1) * limit;
    
    const [followers, total] = await Promise.all([
      this.marketplaceFollowerModel
        .find({ creator_id: new Types.ObjectId(creatorId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.marketplaceFollowerModel.countDocuments({
        creator_id: new Types.ObjectId(creatorId),
      }),
    ]);

    return { followers, total };
  }

  /**
   * Đếm số followers của creator
   */
  async getFollowerCount(creatorId: string): Promise<number> {
    return this.marketplaceFollowerModel.countDocuments({
      creator_id: new Types.ObjectId(creatorId),
    });
  }

  /**
   * Đếm số creators mà user đang follow
   */
  async getFollowingCount(followerId: string): Promise<number> {
    return this.marketplaceFollowerModel.countDocuments({
      follower_id: new Types.ObjectId(followerId),
    });
  }
}
