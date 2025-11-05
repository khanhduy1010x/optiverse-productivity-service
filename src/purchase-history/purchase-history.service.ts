import { Injectable } from '@nestjs/common';
import { PurchaseHistoryRepository } from './purchase-history.repository';
import { CreatePurchaseHistoryDto } from './dto/request/create-purchase-history.dto';
import { PurchaseHistoryResponseDto } from './dto/response/purchase-history-response.dto';

@Injectable()
export class PurchaseHistoryService {
  constructor(private readonly repo: PurchaseHistoryRepository) {}

  async create(dto: CreatePurchaseHistoryDto): Promise<PurchaseHistoryResponseDto> {
    const purchaseHistory = await this.repo.create(dto);
    return new PurchaseHistoryResponseDto(purchaseHistory);
  }

  async checkIfAlreadyPurchased(buyerId: string, marketplaceItemId: string): Promise<boolean> {
    const purchase = await this.repo.findByBuyerAndMarketplaceItem(buyerId, marketplaceItemId);
    return !!purchase;
  }

  async findByBuyer(buyerId: string, page: number = 1, limit: number = 10) {
    const result = await this.repo.findByBuyer(buyerId, page, limit);
    return {
      items: result.items.map(item => new PurchaseHistoryResponseDto(item)),
      total: result.total,
    };
  }

  async findBySeller(sellerId: string, page: number = 1, limit: number = 10) {
    const result = await this.repo.findBySeller(sellerId, page, limit);
    return {
      items: result.items.map(item => new PurchaseHistoryResponseDto(item)),
      total: result.total,
    };
  }

  async countPurchasesByMarketplaceItem(marketplaceItemId: string): Promise<number> {
    return await this.repo.countByMarketplaceItem(marketplaceItemId);
  }

  /**
   * Count user's purchases in current month
   * @param userId - Buyer user ID
   * @returns Count of purchases made in current month
   */
  async countMonthlyPurchases(userId: string): Promise<number> {
    return await this.repo.countMonthlyPurchasesByBuyer(userId);
  }
  async getSalesAnalytics(sellerId: string) {
    return await this.repo.getSalesAnalytics(sellerId);
  }
}
