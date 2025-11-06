import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PurchaseHistory, PurchaseHistoryDocument } from '../purchase-history/purchase-history.schema';
import { TimePeriod, RankingMetric } from './dto/request/get-leaderboard.dto';

@Injectable()
export class LeaderboardRepository {
  constructor(
    @InjectModel(PurchaseHistory.name)
    private purchaseHistoryModel: Model<PurchaseHistoryDocument>,
  ) {}

  private getDateRange(timePeriod: TimePeriod) {
    const now = new Date();
    
    if (timePeriod === TimePeriod.WEEKLY) {
      // Get start of week (Monday)
      const date = new Date(now);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const start = new Date(date.setDate(diff));
      start.setHours(0, 0, 0, 0);
      
      // Get end of week (Sunday)
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      
      return { start, end };
    } else {
      // Monthly
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      
      return { start, end };
    }
  }

  async getLeaderboard(
    timePeriod: TimePeriod,
    metric: RankingMetric,
    page: number,
    limit: number,
  ) {
    const { start, end } = this.getDateRange(timePeriod);

    // Build the aggregation pipeline
    const pipeline: any[] = [
      {
        $match: {
          purchased_at: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: '$buyer_id',
          totalProducts: { $sum: 1 },
          totalSpending: { $sum: '$price' },
        },
      },
    ];

    // Add sorting based on metric
    if (metric === RankingMetric.TOTAL_PRODUCTS) {
      pipeline.push({
        $sort: { totalProducts: -1, totalSpending: -1 },
      });
    } else {
      pipeline.push({
        $sort: { totalSpending: -1, totalProducts: -1 },
      });
    }

    // Add pagination
    pipeline.push({
      $skip: (page - 1) * limit,
    });
    pipeline.push({
      $limit: limit,
    });

    // Get ranked data
    const rankedData = await this.purchaseHistoryModel.aggregate(pipeline);

    // Get total count for pagination
    const countPipeline: any[] = [
      {
        $match: {
          purchased_at: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: '$buyer_id',
        },
      },
      {
        $count: 'total',
      },
    ];

    const countResult = await this.purchaseHistoryModel.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    return {
      data: rankedData,
      total,
      startDate: start,
      endDate: end,
    };
  }

  async getUserLeaderboardRank(
    userId: string,
    timePeriod: TimePeriod,
    metric: RankingMetric,
  ) {
    const { start, end } = this.getDateRange(timePeriod);

    // Get user's stats
    const userStats = await this.purchaseHistoryModel.aggregate([
      {
        $match: {
          buyer_id: userId,
          purchased_at: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: '$buyer_id',
          totalProducts: { $sum: 1 },
          totalSpending: { $sum: '$price' },
        },
      },
    ]);

    if (!userStats || userStats.length === 0) {
      return {
        rank: 0,
        totalProducts: 0,
        totalSpending: 0,
      };
    }

    const userStat = userStats[0];

    // Count how many users are ranked above this user
    const rankPipeline: any[] = [
      {
        $match: {
          purchased_at: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: '$buyer_id',
          totalProducts: { $sum: 1 },
          totalSpending: { $sum: '$price' },
        },
      },
    ];

    if (metric === RankingMetric.TOTAL_PRODUCTS) {
      rankPipeline.push({
        $match: {
          totalProducts: { $gt: userStat.totalProducts },
        },
      });
    } else {
      rankPipeline.push({
        $match: {
          totalSpending: { $gt: userStat.totalSpending },
        },
      });
    }

    rankPipeline.push({
      $count: 'count',
    });

    const rankResult = await this.purchaseHistoryModel.aggregate(rankPipeline);
    const rank = (rankResult[0]?.count || 0) + 1;

    return {
      rank,
      totalProducts: userStat.totalProducts,
      totalSpending: userStat.totalSpending,
    };
  }
}
