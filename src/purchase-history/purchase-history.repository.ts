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

  /**
   * Count purchases made by buyer in current month
   * @param buyerId - Buyer user ID
   * @returns Count of purchases made in current month
   */
  async countMonthlyPurchasesByBuyer(buyerId: string): Promise<number> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    return await this.purchaseHistoryModel.countDocuments({
      buyer_id: new Types.ObjectId(buyerId),
      purchased_at: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    });
  }
  async getSalesAnalytics(sellerId: string) {
    const sellerObjectId = new Types.ObjectId(sellerId);

    // Aggregate total revenue and sales count
    const totalStats = await this.purchaseHistoryModel.aggregate([
      { $match: { seller_id: sellerObjectId } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$price' },
          totalSales: { $sum: 1 },
        },
      },
    ]);

    // Aggregate sales by month (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const salesByMonth = await this.purchaseHistoryModel.aggregate([
      {
        $match: {
          seller_id: sellerObjectId,
          purchased_at: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$purchased_at' },
            month: { $month: '$purchased_at' },
          },
          revenue: { $sum: '$price' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Aggregate top selling items (top 10)
    const topSellingItems = await this.purchaseHistoryModel.aggregate([
      { $match: { seller_id: sellerObjectId } },
      {
        $group: {
          _id: '$marketplace_item_id',
          totalRevenue: { $sum: '$price' },
          totalSales: { $sum: 1 },
        },
      },
      { $sort: { totalSales: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'marketplace_items',
          localField: '_id',
          foreignField: '_id',
          as: 'item',
        },
      },
      { $unwind: '$item' },
      {
        $project: {
          _id: 1,
          totalRevenue: 1,
          totalSales: 1,
          title: '$item.title',
          price: '$item.price',
        },
      },
    ]);

    return {
      totalRevenue: totalStats[0]?.totalRevenue || 0,
      totalSales: totalStats[0]?.totalSales || 0,
      salesByMonth,
      topSellingItems,
    };
  }
}
