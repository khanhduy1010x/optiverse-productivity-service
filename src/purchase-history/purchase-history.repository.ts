import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PurchaseHistory } from './purchase-history.schema';
import { CreatePurchaseHistoryDto } from './dto/request/create-purchase-history.dto';
import { UserHttpClient } from '../http-axios/user-http.client';

@Injectable()
export class PurchaseHistoryRepository {
  constructor(
    @InjectModel(PurchaseHistory.name)
    private readonly purchaseHistoryModel: Model<PurchaseHistory>,
    private readonly userHttpClient: UserHttpClient,
  ) {}

  async create(dto: CreatePurchaseHistoryDto): Promise<PurchaseHistory> {
    const newPurchaseHistory = new this.purchaseHistoryModel({
      buyer_id: new Types.ObjectId(dto.buyer_id),
      seller_id: new Types.ObjectId(dto.seller_id),
      marketplace_item_id: new Types.ObjectId(dto.marketplace_item_id),
      price: dto.price,
    });
    return await newPurchaseHistory.save();
  }

  async findByBuyerAndMarketplaceItem(
    buyerId: string,
    marketplaceItemId: string,
  ): Promise<PurchaseHistory | null> {
    return await this.purchaseHistoryModel.findOne({
      buyer_id: new Types.ObjectId(buyerId),
      marketplace_item_id: new Types.ObjectId(marketplaceItemId),
    });
  }

  async findByBuyer(buyerId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const items = await this.purchaseHistoryModel
      .find({ buyer_id: new Types.ObjectId(buyerId) })
      .populate('marketplace_item_id')
      .sort({ purchased_at: -1 })
      .skip(skip)
      .limit(limit);

    // Fetch user info from core-service for each item's creator
    const enrichedItems = await Promise.all(
      items.map(async (item: any) => {
        const itemObj = item.toObject();
        try {
          if (itemObj.marketplace_item_id?.creator_id) {
            const creatorId = itemObj.marketplace_item_id.creator_id.toString();
            const users = await this.userHttpClient.getUsersByIds([creatorId]);
            if (users.length > 0) {
              itemObj.marketplace_item_id.creator_info = users[0];
            }
          }
        } catch (error) {
          console.error(`Failed to fetch user info for creator:`, error);
        }
        return itemObj;
      }),
    );

    const total = await this.purchaseHistoryModel.countDocuments({
      buyer_id: new Types.ObjectId(buyerId),
    });

    return { items: enrichedItems, total };
  }

  async findBySeller(sellerId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const items = await this.purchaseHistoryModel
      .find({ seller_id: new Types.ObjectId(sellerId) })
      .populate('marketplace_item_id')
      .sort({ purchased_at: -1 })
      .skip(skip)
      .limit(limit);

    // Fetch user info from core-service for each item's creator
    const enrichedItems = await Promise.all(
      items.map(async (item: any) => {
        const itemObj = item.toObject();
        try {
          if (itemObj.marketplace_item_id?.creator_id) {
            const creatorId = itemObj.marketplace_item_id.creator_id.toString();
            const users = await this.userHttpClient.getUsersByIds([creatorId]);
            if (users.length > 0) {
              itemObj.marketplace_item_id.creator_info = users[0];
            }
          }
        } catch (error) {
          console.error(`Failed to fetch user info for creator:`, error);
        }
        return itemObj;
      }),
    );

    const total = await this.purchaseHistoryModel.countDocuments({
      seller_id: new Types.ObjectId(sellerId),
    });

    return { items: enrichedItems, total };
  }

  async countByMarketplaceItem(marketplaceItemId: string): Promise<number> {
    return await this.purchaseHistoryModel.countDocuments({
      marketplace_item_id: new Types.ObjectId(marketplaceItemId),
    });
  }
}
