import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Rating } from './rating.schema';

@Injectable()
export class RatingRepository {
  constructor(
    @InjectModel(Rating.name)
    private ratingModel: Model<Rating>,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ ratings: Rating[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const [ratings, total] = await Promise.all([
        this.ratingModel
          .find()
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.ratingModel.countDocuments().exec(),
      ]);

      return { ratings, total };
    } catch (error) {
      console.error('Error in rating repository findAll:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Rating | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.ratingModel.findById(id).exec();
  }

  async findByMarketplaceId(
    marketplaceId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ ratings: Rating[]; total: number }> {
    if (!Types.ObjectId.isValid(marketplaceId)) {
      return { ratings: [], total: 0 };
    }

    try {
      const skip = (page - 1) * limit;
      const query = { marketplace_id: new Types.ObjectId(marketplaceId) };

      const [ratings, total] = await Promise.all([
        this.ratingModel
          .find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.ratingModel.countDocuments(query).exec(),
      ]);

      return { ratings, total };
    } catch (error) {
      console.error('Error in rating repository findByMarketplaceId:', error);
      throw error;
    }
  }

  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ ratings: Rating[]; total: number }> {
    if (!Types.ObjectId.isValid(userId)) {
      return { ratings: [], total: 0 };
    }

    try {
      const skip = (page - 1) * limit;
      const query = { user_id: new Types.ObjectId(userId) };

      const [ratings, total] = await Promise.all([
        this.ratingModel
          .find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.ratingModel.countDocuments(query).exec(),
      ]);

      return { ratings, total };
    } catch (error) {
      console.error('Error in rating repository findByUserId:', error);
      throw error;
    }
  }

  async findByMarketplaceAndUser(
    marketplaceId: string,
    userId: string,
  ): Promise<Rating | null> {
    if (!Types.ObjectId.isValid(marketplaceId) || !Types.ObjectId.isValid(userId)) {
      return null;
    }

    return this.ratingModel
      .findOne({
        marketplace_id: new Types.ObjectId(marketplaceId),
        user_id: new Types.ObjectId(userId),
      })
      .exec();
  }

  async create(data: Partial<Rating>): Promise<Rating> {
    const newRating = new this.ratingModel(data);
    return newRating.save();
  }

  async update(id: string, data: Partial<Rating>): Promise<Rating | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.ratingModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }
    const result = await this.ratingModel.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }

  async getAverageRating(marketplaceId: string): Promise<number> {
    if (!Types.ObjectId.isValid(marketplaceId)) {
      return 0;
    }

    const result = await this.ratingModel
      .aggregate([
        { $match: { marketplace_id: new Types.ObjectId(marketplaceId) } },
        { $group: { _id: null, averageRating: { $avg: '$rating' } } },
      ])
      .exec();

    return result.length > 0 ? result[0].averageRating : 0;
  }

  async getRatingStats(marketplaceId: string): Promise<{
    totalRatings: number;
    averageRating: number;
    ratingDistribution: Record<number, number>;
  }> {
    if (!Types.ObjectId.isValid(marketplaceId)) {
      return { totalRatings: 0, averageRating: 0, ratingDistribution: {} };
    }

    const ratings = await this.ratingModel
      .find({ marketplace_id: new Types.ObjectId(marketplaceId) })
      .exec();

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let total = 0;

    for (const rating of ratings) {
      distribution[rating.rating]++;
      total += rating.rating;
    }

    const averageRating = ratings.length > 0 ? total / ratings.length : 0;

    return {
      totalRatings: ratings.length,
      averageRating,
      ratingDistribution: distribution,
    };
  }

  async deleteByMarketplaceId(marketplaceId: string): Promise<number> {
    if (!Types.ObjectId.isValid(marketplaceId)) {
      return 0;
    }
    const result = await this.ratingModel
      .deleteMany({ marketplace_id: new Types.ObjectId(marketplaceId) })
      .exec();
    return result.deletedCount;
  }
}
