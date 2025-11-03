import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { RatingService } from './rating.service';
import { CreateRatingRequest } from './dto/request/CreateRatingRequest.dto';
import { UpdateRatingRequest } from './dto/request/UpdateRatingRequest.dto';
import { RatingResponse } from './dto/response/RatingResponse.dto';
import { ApiResponse as ApiResponseWrapper } from 'src/common/api-response';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';

@Controller('marketplace/ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  /**
   * Lấy tất cả đánh giá (có phân trang)
   */
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<ApiResponseWrapper<{ ratings: RatingResponse[]; total: number }>> {
    const result = await this.ratingService.findAll(page, limit);
    return new ApiResponseWrapper(result);
  }

  /**
   * Lấy tất cả đánh giá của một marketplace item
   */
  @Get('item/:marketplaceId')
  async findByMarketplaceId(
    @Param('marketplaceId') marketplaceId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<ApiResponseWrapper<{ ratings: RatingResponse[]; total: number }>> {
    const result = await this.ratingService.findByMarketplaceId(marketplaceId, page, limit);
    return new ApiResponseWrapper(result);
  }

  /**
   * Lấy thông tin thống kê đánh giá của một marketplace item
   */
  @Get('stats/:marketplaceId')
  async getRatingStats(
    @Param('marketplaceId') marketplaceId: string,
  ): Promise<
    ApiResponseWrapper<{
      totalRatings: number;
      averageRating: number;
      ratingDistribution: Record<number, number>;
    }>
  > {
    const stats = await this.ratingService.getRatingStats(marketplaceId);
    return new ApiResponseWrapper(stats);
  }

  /**
   * Lấy đánh giá trung bình
   */
  @Get('average/:marketplaceId')
  async getAverageRating(
    @Param('marketplaceId') marketplaceId: string,
  ): Promise<ApiResponseWrapper<{ averageRating: number }>> {
    const averageRating = await this.ratingService.getAverageRating(marketplaceId);
    return new ApiResponseWrapper({ averageRating });
  }

  /**
   * Lấy tất cả đánh giá của người dùng hiện tại
   */
  @Get('user/my-ratings')
  async findMyRatings(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<ApiResponseWrapper<{ ratings: RatingResponse[]; total: number }>> {
    const userId = req.userInfo?.userId;
    if (!userId) {
      throw new AppException(ErrorCode.UNAUTHENTICATED);
    }
    const result = await this.ratingService.findByUserId(userId, page, limit);
    return new ApiResponseWrapper(result);
  }

  /**
   * Lấy đánh giá theo ID
   */
  @Get(':id')
  async findById(@Param('id') id: string): Promise<ApiResponseWrapper<RatingResponse>> {
    const rating = await this.ratingService.findById(id);
    return new ApiResponseWrapper(rating);
  }

  /**
   * Tạo đánh giá mới
   */
  @Post()
  async create(
    @Request() req,
    @Body() createDto: CreateRatingRequest,
  ): Promise<ApiResponseWrapper<RatingResponse>> {
    const userId = req.userInfo?.userId;
    if (!userId) {
      throw new AppException(ErrorCode.UNAUTHENTICATED);
    }
    const rating = await this.ratingService.create(userId, createDto);
    return new ApiResponseWrapper(rating);
  }

  /**
   * Cập nhật đánh giá
   */
  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateRatingRequest,
  ): Promise<ApiResponseWrapper<RatingResponse>> {
    const userId = req.userInfo?.userId;
    if (!userId) {
      throw new AppException(ErrorCode.UNAUTHENTICATED);
    }
    const rating = await this.ratingService.update(id, userId, updateDto);
    return new ApiResponseWrapper(rating);
  }

  /**
   * Xóa đánh giá
   */
  @Delete(':id')
  async delete(
    @Request() req,
    @Param('id') id: string,
  ): Promise<ApiResponseWrapper<{ success: boolean }>> {
    const userId = req.userInfo?.userId;
    if (!userId) {
      throw new AppException(ErrorCode.UNAUTHENTICATED);
    }
    const result = await this.ratingService.delete(id, userId);
    return new ApiResponseWrapper(result);
  }
}
