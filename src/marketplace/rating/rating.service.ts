import { Injectable } from '@nestjs/common';
import { RatingRepository } from './rating.repository';
import { Rating } from './rating.schema';
import { CreateRatingRequest } from './dto/request/CreateRatingRequest.dto';
import { UpdateRatingRequest } from './dto/request/UpdateRatingRequest.dto';
import { RatingResponse } from './dto/response/RatingResponse.dto';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { Types } from 'mongoose';
import { UserHttpClient } from 'src/http-axios/user-http.client';

@Injectable()
export class RatingService {
  constructor(
    private readonly ratingRepository: RatingRepository,
    private readonly userHttpClient: UserHttpClient,
  ) {}

  private async toResponseDto(rating: Rating): Promise<RatingResponse> {
    let userInfo: any = null;
    try {
      const userId = rating.user_id.toString();
      console.log(`[RatingService] Fetching user info for user_id: ${userId}`);
      const users = await this.userHttpClient.getUsersByIds([userId]);
      if (users && users.length > 0) {
        userInfo = users[0];
        console.log(`[RatingService] Successfully fetched user info:`, userInfo);
      } else {
        console.warn(`[RatingService] No user info returned for user_id: ${userId}`);
      }
    } catch (error) {
      console.error(`[RatingService] Failed to fetch user info for rating ${rating._id}:`, error.message);
    }

    return {
      _id: rating._id.toString(),
      marketplace_id: rating.marketplace_id.toString(),
      user_id: rating.user_id.toString(),
      user_info: userInfo || undefined,
      comment: rating.comment,
      rating: rating.rating,
      createdAt: rating.createdAt,
      updatedAt: rating.updatedAt,
    };
  }

  /**
   * Lấy tất cả đánh giá (có phân trang)
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ ratings: RatingResponse[]; total: number }> {
    const { ratings, total } = await this.ratingRepository.findAll(page, limit);
    const responseRatings = await Promise.all(ratings.map((r) => this.toResponseDto(r)));
    return { ratings: responseRatings, total };
  }

  /**
   * Lấy đánh giá theo ID
   */
  async findById(id: string): Promise<RatingResponse> {
    const rating = await this.ratingRepository.findById(id);
    if (!rating) {
      throw new AppException(ErrorCode.RATING_NOT_FOUND);
    }
    return this.toResponseDto(rating);
  }

  /**
   * Lấy tất cả đánh giá của một marketplace item
   */
  async findByMarketplaceId(
    marketplaceId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ ratings: RatingResponse[]; total: number }> {
    const { ratings, total } = await this.ratingRepository.findByMarketplaceId(
      marketplaceId,
      page,
      limit,
    );
    const responseRatings = await Promise.all(ratings.map((r) => this.toResponseDto(r)));
    return { ratings: responseRatings, total };
  }

  /**
   * Lấy tất cả đánh giá của một người dùng
   */
  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ ratings: RatingResponse[]; total: number }> {
    const { ratings, total } = await this.ratingRepository.findByUserId(userId, page, limit);
    const responseRatings = await Promise.all(ratings.map((r) => this.toResponseDto(r)));
    return { ratings: responseRatings, total };
  }

  /**
   * Tạo đánh giá mới
   */
  async create(userId: string, createDto: CreateRatingRequest): Promise<RatingResponse> {
    // Kiểm tra xem người dùng đã đánh giá marketplace item này chưa
    const existingRating = await this.ratingRepository.findByMarketplaceAndUser(
      createDto.marketplace_id,
      userId,
    );

    if (existingRating) {
      throw new AppException(ErrorCode.DUPLICATE_RATING);
    }

    const rating = await this.ratingRepository.create({
      marketplace_id: new Types.ObjectId(createDto.marketplace_id),
      user_id: new Types.ObjectId(userId),
      comment: createDto.comment,
      rating: createDto.rating,
    });

    return this.toResponseDto(rating);
  }

  /**
   * Cập nhật đánh giá
   */
  async update(
    ratingId: string,
    userId: string,
    updateDto: UpdateRatingRequest,
  ): Promise<RatingResponse> {
    const rating = await this.ratingRepository.findById(ratingId);
    if (!rating) {
      throw new AppException(ErrorCode.RATING_NOT_FOUND);
    }

    // Kiểm tra quyền sở hữu
    if (rating.user_id.toString() !== userId) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    const updated = await this.ratingRepository.update(ratingId, {
      rating: updateDto.rating ?? rating.rating,
      comment: updateDto.comment ?? rating.comment,
    });

    if (!updated) {
      throw new AppException(ErrorCode.RATING_NOT_FOUND);
    }

    return this.toResponseDto(updated);
  }

  /**
   * Xóa đánh giá
   */
  async delete(ratingId: string, userId: string): Promise<{ success: boolean }> {
    const rating = await this.ratingRepository.findById(ratingId);
    if (!rating) {
      throw new AppException(ErrorCode.RATING_NOT_FOUND);
    }

    // Kiểm tra quyền sở hữu
    if (rating.user_id.toString() !== userId) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    const success = await this.ratingRepository.delete(ratingId);
    return { success };
  }

  /**
   * Lấy thông tin thống kê đánh giá của một marketplace item
   */
  async getRatingStats(marketplaceId: string): Promise<{
    totalRatings: number;
    averageRating: number;
    ratingDistribution: Record<number, number>;
  }> {
    return this.ratingRepository.getRatingStats(marketplaceId);
  }

  /**
   * Lấy đánh giá trung bình
   */
  async getAverageRating(marketplaceId: string): Promise<number> {
    return this.ratingRepository.getAverageRating(marketplaceId);
  }
}
