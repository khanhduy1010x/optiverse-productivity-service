import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LeaderboardRepository } from './leaderboard.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

// Define schema for caching leaderboard results
export interface LeaderboardCache {
  _id?: string;
  timePeriod: string; // 'weekly' or 'monthly'
  metric: string; // 'total_products' or 'total_spending'
  data: any[];
  cachedAt: Date;
  expiresAt: Date;
}

@Injectable()
export class LeaderboardSchedulerService {
  private readonly logger = new Logger(LeaderboardSchedulerService.name);

  constructor(
    private readonly leaderboardRepository: LeaderboardRepository,
    @InjectModel('LeaderboardCache')
    private leaderboardCacheModel: Model<LeaderboardCache>,
  ) {}

  /**
   * Chạy mỗi ngày lúc 12:00 AM (nửa đêm) để cập nhật bảng xếp hạng hàng tháng
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async refreshMonthlyLeaderboardCache() {
    try {
      this.logger.log('Starting monthly leaderboard cache refresh...');

      // Làm mới cache cho ranking theo tổng chi tiêu
      await this.refreshCacheForMetric('monthly', 'total_spending');

      // Làm mới cache cho ranking theo sản phẩm mua
      await this.refreshCacheForMetric('monthly', 'total_products');

      this.logger.log('Monthly leaderboard cache refresh completed successfully');
    } catch (error) {
      this.logger.error('Error refreshing monthly leaderboard cache:', error);
    }
  }

  /**
   * Chạy mỗi thứ 2 lúc 12:00 AM để cập nhật bảng xếp hạng hàng tuần
   */
  @Cron('0 0 * * 1') // Every Monday at 00:00
  async refreshWeeklyLeaderboardCache() {
    try {
      this.logger.log('Starting weekly leaderboard cache refresh...');

      // Làm mới cache cho ranking theo tổng chi tiêu
      await this.refreshCacheForMetric('weekly', 'total_spending');

      // Làm mới cache cho ranking theo sản phẩm mua
      await this.refreshCacheForMetric('weekly', 'total_products');

      this.logger.log('Weekly leaderboard cache refresh completed successfully');
    } catch (error) {
      this.logger.error('Error refreshing weekly leaderboard cache:', error);
    }
  }

  /**
   * Chạy mỗi giờ để xóa cache đã hết hạn
   */
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredCache() {
    try {
      this.logger.log('Cleaning up expired leaderboard cache...');

      const result = await this.leaderboardCacheModel.deleteMany({
        expiresAt: { $lt: new Date() },
      });

      this.logger.log(`Deleted ${result.deletedCount} expired cache entries`);
    } catch (error) {
      this.logger.error('Error cleaning up expired cache:', error);
    }
  }

  /**
   * Chạy mỗi ngày lúc 6:00 AM để tính toán thống kê leaderboard
   */
  @Cron('0 6 * * *') // Every day at 06:00
  async generateDailyLeaderboardStatistics() {
    try {
      this.logger.log('Generating daily leaderboard statistics...');

      const stats = {
        timestamp: new Date(),
        monthlyBySpending: await this.getLeaderboardStats('monthly', 'total_spending'),
        monthlyByProducts: await this.getLeaderboardStats('monthly', 'total_products'),
        weeklyBySpending: await this.getLeaderboardStats('weekly', 'total_spending'),
        weeklyByProducts: await this.getLeaderboardStats('weekly', 'total_products'),
      };

      // Lưu thống kê vào database hoặc file
      this.logger.log('Daily statistics generated:', JSON.stringify(stats, null, 2));

      // Optional: Gửi thống kê đến monitoring system
      // await this.sendMetricsToMonitoring(stats);
    } catch (error) {
      this.logger.error('Error generating daily leaderboard statistics:', error);
    }
  }

  /**
   * Chạy mỗi phút để kiểm tra sức khỏe của service
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async healthCheck() {
    try {
      // Kiểm tra xem service còn hoạt động không
      const cacheCount = await this.leaderboardCacheModel.countDocuments();
      this.logger.debug(`Leaderboard service health check: ${cacheCount} cache entries`);
    } catch (error) {
      this.logger.error('Leaderboard service health check failed:', error);
    }
  }

  /**
   * Helper: Làm mới cache cho một metric cụ thể
   */
  private async refreshCacheForMetric(timePeriod: string, metric: string) {
    try {
      // Lấy top 100 để cache
      const { data, total } = await this.leaderboardRepository.getLeaderboard(
        timePeriod as any,
        metric as any,
        1,
        100,
      );

      // Tính thời gian hết hạn cache
      let expiresAt = new Date();
      if (timePeriod === 'weekly') {
        expiresAt.setDate(expiresAt.getDate() + 7); // Cache 7 ngày cho weekly
      } else {
        // ✅ Tính đến cuối tháng hiện tại (xử lý đúng tháng 28/29/30/31 ngày)
        const currentMonth = expiresAt.getMonth();
        const currentYear = expiresAt.getFullYear();
        
        // Cuối tháng = Ngày 1 tháng sau - 1 giây
        const nextMonth = new Date(currentYear, currentMonth + 1, 1, 0, 0, 0, 0);
        expiresAt = new Date(nextMonth.getTime() - 1000);
      }

      // Upsert cache
      await this.leaderboardCacheModel.updateOne(
        { timePeriod, metric },
        {
          timePeriod,
          metric,
          data,
          cachedAt: new Date(),
          expiresAt,
        },
        { upsert: true },
      );

      this.logger.log(
        `Cache refreshed for ${timePeriod} / ${metric} (${data.length} entries)`,
      );
    } catch (error) {
      this.logger.error(`Error refreshing cache for ${timePeriod} / ${metric}:`, error);
      throw error;
    }
  }

  /**
   * Helper: Lấy thống kê cho leaderboard
   */
  private async getLeaderboardStats(timePeriod: string, metric: string) {
    try {
      const { data, total } = await this.leaderboardRepository.getLeaderboard(
        timePeriod as any,
        metric as any,
        1,
        10,
      );

      return {
        total,
        topUser: data[0] ? data[0]._id : null,
        averageScore: this.calculateAverage(data, metric),
        entriesCount: data.length,
      };
    } catch (error) {
      this.logger.error(`Error getting stats for ${timePeriod} / ${metric}:`, error);
      return null;
    }
  }

  /**
   * Helper: Tính giá trị trung bình
   */
  private calculateAverage(data: any[], metric: string): number {
    if (data.length === 0) return 0;

    const metricField = metric === 'total_spending' ? 'totalSpending' : 'totalProducts';
    const sum = data.reduce((acc, item) => acc + (item[metricField] || 0), 0);

    return Math.round(sum / data.length);
  }

  /**
   * Method: Lấy cached leaderboard
   */
  async getCachedLeaderboard(timePeriod: string, metric: string) {
    try {
      const cache = await this.leaderboardCacheModel.findOne({
        timePeriod,
        metric,
        expiresAt: { $gt: new Date() },
      });

      if (!cache) {
        this.logger.log(`No valid cache found for ${timePeriod} / ${metric}`);
        return null;
      }

      this.logger.log(`Cache hit for ${timePeriod} / ${metric}`);
      return cache;
    } catch (error) {
      this.logger.error('Error retrieving cached leaderboard:', error);
      return null;
    }
  }

  /**
   * Method: Xóa cache thủ công
   */
  async clearCache(timePeriod?: string, metric?: string) {
    try {
      const query: any = {};
      if (timePeriod) query.timePeriod = timePeriod;
      if (metric) query.metric = metric;

      const result = await this.leaderboardCacheModel.deleteMany(query);
      this.logger.log(`Cleared ${result.deletedCount} cache entries`);

      return { deletedCount: result.deletedCount };
    } catch (error) {
      this.logger.error('Error clearing cache:', error);
      throw error;
    }
  }

  /**
   * Method: Lấy tất cả cached entries
   */
  async getAllCachedEntries() {
    try {
      const caches = await this.leaderboardCacheModel.find().lean();
      return caches;
    } catch (error) {
      this.logger.error('Error retrieving all cached entries:', error);
      return [];
    }
  }
}
