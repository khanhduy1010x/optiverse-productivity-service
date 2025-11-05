import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { MarketplaceFavoriteService } from './marketplace-favorite.service';
import { ApiResponse as ApiResponseWrapper } from 'src/common/api-response';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { MarketplaceItemResponseDto } from '../marketplace/dto/response/marketplace-item-response.dto';

@Controller('marketplace/favorites')
export class MarketplaceFavoriteController {
  constructor(private readonly favoriteService: MarketplaceFavoriteService) {}

  /**
   * Thêm item vào favorites
   */
  @Post('add')
  async addFavorite(
    @Request() req,
    @Body('marketplace_item_id') marketplaceItemId: string,
  ): Promise<ApiResponseWrapper<{ message: string }>> {
    const userId = req.userInfo?.userId;
    if (!userId) {
      throw new AppException(ErrorCode.UNAUTHENTICATED);
    }

    const result = await this.favoriteService.addFavorite(userId, marketplaceItemId);
    return new ApiResponseWrapper(result);
  }

  /**
   * Xóa item khỏi favorites
   */
  @Delete('remove/:marketplaceItemId')
  async removeFavorite(
    @Request() req,
    @Param('marketplaceItemId') marketplaceItemId: string,
  ): Promise<ApiResponseWrapper<{ message: string }>> {
    const userId = req.userInfo?.userId;
    if (!userId) {
      throw new AppException(ErrorCode.UNAUTHENTICATED);
    }

    const result = await this.favoriteService.removeFavorite(userId, marketplaceItemId);
    return new ApiResponseWrapper(result);
  }

  /**
   * Toggle favorite (thêm/xóa)
   */
  @Post('toggle')
  async toggleFavorite(
    @Request() req,
    @Body('marketplace_item_id') marketplaceItemId: string,
  ): Promise<ApiResponseWrapper<{ isFavorited: boolean; message: string }>> {
    const userId = req.userInfo?.userId;
    if (!userId) {
      throw new AppException(ErrorCode.UNAUTHENTICATED);
    }

    const result = await this.favoriteService.toggleFavorite(userId, marketplaceItemId);
    return new ApiResponseWrapper(result);
  }

  /**
   * Kiểm tra item đã được favorite chưa
   */
  @Get('check/:marketplaceItemId')
  async checkFavorite(
    @Request() req,
    @Param('marketplaceItemId') marketplaceItemId: string,
  ): Promise<ApiResponseWrapper<{ isFavorited: boolean }>> {
    const userId = req.userInfo?.userId;
    if (!userId) {
      throw new AppException(ErrorCode.UNAUTHENTICATED);
    }

    const result = await this.favoriteService.checkFavorite(userId, marketplaceItemId);
    return new ApiResponseWrapper(result);
  }

  /**
   * Lấy danh sách favorites của user
   */
  @Get('my-favorites')
  async getMyFavorites(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<ApiResponseWrapper<{ items: MarketplaceItemResponseDto[]; total: number }>> {
    const userId = req.userInfo?.userId;
    if (!userId) {
      throw new AppException(ErrorCode.UNAUTHENTICATED);
    }

    const result = await this.favoriteService.getMyFavorites(userId, page, limit);
    return new ApiResponseWrapper(result);
  }

  /**
   * Lấy số lượng favorites của một item
   */
  @Get('count/:marketplaceItemId')
  async getFavoriteCount(
    @Param('marketplaceItemId') marketplaceItemId: string,
  ): Promise<ApiResponseWrapper<{ count: number }>> {
    const result = await this.favoriteService.getFavoriteCount(marketplaceItemId);
    return new ApiResponseWrapper(result);
  }
}
