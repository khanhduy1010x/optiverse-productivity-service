import { Injectable } from '@nestjs/common';
import { MarketplaceFavoriteRepository } from './marketplace-favorite.repository';
import { MarketplaceItemRepository } from '../marketplace/marketplace-item.repository';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { MarketplaceItemResponseDto } from '../marketplace/dto/response/marketplace-item-response.dto';
import { UserHttpClient } from 'src/http-axios/user-http.client';
import { PurchaseHistoryService } from 'src/purchase-history/purchase-history.service';

@Injectable()
export class MarketplaceFavoriteService {
  constructor(
    private readonly favoriteRepo: MarketplaceFavoriteRepository,
    private readonly marketplaceItemRepo: MarketplaceItemRepository,
    private readonly userHttpClient: UserHttpClient,
    private readonly purchaseHistoryService: PurchaseHistoryService,
  ) {}

  /**
   * Thêm item vào favorites
   */
  async addFavorite(userId: string, marketplaceItemId: string): Promise<{ message: string }> {
    // Kiểm tra marketplace item có tồn tại không
    const item = await this.marketplaceItemRepo.findById(marketplaceItemId);
    if (!item) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }

    // Kiểm tra đã favorite chưa
    const alreadyFavorited = await this.favoriteRepo.isFavorited(userId, marketplaceItemId);
    if (alreadyFavorited) {
      throw new AppException(ErrorCode.DUPLICATE_RATING); // Tạm dùng DUPLICATE_RATING
    }

    // Thêm vào favorites
    await this.favoriteRepo.create(userId, marketplaceItemId);

    return { message: 'Item đã được thêm vào danh sách yêu thích' };
  }

  /**
   * Xóa item khỏi favorites
   */
  async removeFavorite(userId: string, marketplaceItemId: string): Promise<{ message: string }> {
    const removed = await this.favoriteRepo.remove(userId, marketplaceItemId);
    
    if (!removed) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }

    return { message: 'Item đã được xóa khỏi danh sách yêu thích' };
  }

  /**
   * Toggle favorite (thêm nếu chưa có, xóa nếu đã có)
   */
  async toggleFavorite(userId: string, marketplaceItemId: string): Promise<{ 
    isFavorited: boolean; 
    message: string 
  }> {
    const isFavorited = await this.favoriteRepo.isFavorited(userId, marketplaceItemId);
    
    if (isFavorited) {
      await this.favoriteRepo.remove(userId, marketplaceItemId);
      return {
        isFavorited: false,
        message: 'Item đã được xóa khỏi danh sách yêu thích'
      };
    } else {
      // Kiểm tra item tồn tại
      const item = await this.marketplaceItemRepo.findById(marketplaceItemId);
      if (!item) {
        throw new AppException(ErrorCode.NOT_FOUND);
      }
      
      await this.favoriteRepo.create(userId, marketplaceItemId);
      return {
        isFavorited: true,
        message: 'Item đã được thêm vào danh sách yêu thích'
      };
    }
  }

  /**
   * Kiểm tra item đã được favorite chưa
   */
  async checkFavorite(userId: string, marketplaceItemId: string): Promise<{ isFavorited: boolean }> {
    const isFavorited = await this.favoriteRepo.isFavorited(userId, marketplaceItemId);
    return { isFavorited };
  }

  /**
   * Lấy danh sách marketplace items đã favorite
   */
  async getMyFavorites(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ items: MarketplaceItemResponseDto[]; total: number }> {
    const { favorites, total } = await this.favoriteRepo.findByUserId(userId, page, limit);

    // Lấy thông tin chi tiết các marketplace items
    const items: MarketplaceItemResponseDto[] = [];
    
    for (const favorite of favorites) {
      const item = await this.marketplaceItemRepo.findById(
        favorite.marketplace_item_id.toString()
      );
      
      if (item) {
        // Convert to response DTO
        const itemDto = await this.toResponseDto(item, userId);
        items.push(itemDto);
      }
    }

    return { items, total };
  }

  /**
   * Convert MarketplaceItem to ResponseDto
   */
  private async toResponseDto(item: any, userId?: string): Promise<MarketplaceItemResponseDto> {
    let creatorInfo;
    try {
      const users = await this.userHttpClient.getUsersByIds([item.creator_id.toString()]);
      if (users && users.length > 0) {
        creatorInfo = users[0];
      }
    } catch (error) {
      console.error('Failed to fetch creator info:', error);
    }

    // Get purchase count
    let purchaseCount = 0;
    try {
      purchaseCount = await this.purchaseHistoryService.countPurchasesByMarketplaceItem(
        item._id.toString(),
      );
    } catch (error) {
      console.error('Failed to fetch purchase count:', error);
    }

    // Check if user already purchased
    let isPurchased = false;
    if (userId) {
      try {
        isPurchased = await this.purchaseHistoryService.checkIfAlreadyPurchased(
          userId,
          item._id.toString(),
        );
      } catch (error) {
        console.error('Failed to check purchase status:', error);
      }
    }

    return {
      _id: item._id.toString(),
      creator_id: item.creator_id.toString(),
      creator_info: creatorInfo,
      title: item.title,
      description: item.description,
      images: item.images,
      price: item.price,
      type: item.type,
      type_id: item.type_id ? item.type_id.toString() : undefined,
      purchase_count: purchaseCount,
      is_purchased: isPurchased,
    };
  }

  /**
   * Lấy số lượng favorites của một item
   */
  async getFavoriteCount(marketplaceItemId: string): Promise<{ count: number }> {
    const count = await this.favoriteRepo.countByMarketplaceItem(marketplaceItemId);
    return { count };
  }
}
