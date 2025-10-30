import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PurchaseHistory } from './purchase-history.schema';
import { CreatePurchaseHistoryDto } from './dto/request/create-purchase-history.dto';

@Injectable()
export class PurchaseHistoryRepository {
  constructor(
    @InjectModel(PurchaseHistory.name)
    private readonly purchaseHistoryModel: Model<PurchaseHistory>,
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
      .sort({ purchased_at: -1 })
      .skip(skip)
      .limit(limit);

    const total = await this.purchaseHistoryModel.countDocuments({
      buyer_id: new Types.ObjectId(buyerId),
    });

    return { items, total };
  }

  async findBySeller(sellerId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const items = await this.purchaseHistoryModel
      .find({ seller_id: new Types.ObjectId(sellerId) })
      .sort({ purchased_at: -1 })
      .skip(skip)
      .limit(limit);

    const total = await this.purchaseHistoryModel.countDocuments({
      seller_id: new Types.ObjectId(sellerId),
    });

    return { items, total };
  }

  async countByMarketplaceItem(marketplaceItemId: string): Promise<number> {
    return await this.purchaseHistoryModel.countDocuments({
      marketplace_item_id: new Types.ObjectId(marketplaceItemId),
    });
  }
}
