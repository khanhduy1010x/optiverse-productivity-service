import { Controller, Get, Delete, Param, Query, Post } from '@nestjs/common';
import { LeaderboardSchedulerService } from './leaderboard-scheduler.service';

@Controller('leaderboard')
export class LeaderboardCacheController {
  constructor(private readonly schedulerService: LeaderboardSchedulerService) {}

  /**
   * Lấy tất cả cached leaderboard entries
   */
  @Get('cache/all')
  async getAllCachedEntries() {
    return this.schedulerService.getAllCachedEntries();
  }

  /**
   * Lấy cached leaderboard cho một khoảng thời gian và metric cụ thể
   */
  @Get('cache/:timePeriod/:metric')
  async getCachedLeaderboard(
    @Param('timePeriod') timePeriod: string,
    @Param('metric') metric: string,
  ) {
    return this.schedulerService.getCachedLeaderboard(timePeriod, metric);
  }

  /**
   * Xóa tất cả cache hoặc cache cho một khoảng thời gian/metric cụ thể
   */
  @Delete('cache')
  async clearCache(
    @Query('timePeriod') timePeriod?: string,
    @Query('metric') metric?: string,
  ) {
    return this.schedulerService.clearCache(timePeriod, metric);
  }

  /**
   * Trigger refresh monthly leaderboard cache thủ công
   */
  @Post('cache/refresh/monthly')
  async refreshMonthlyCache() {
    await this.schedulerService.refreshMonthlyLeaderboardCache();
    return { message: 'Monthly leaderboard cache refresh triggered' };
  }

  /**
   * Trigger refresh weekly leaderboard cache thủ công
   */
  @Post('cache/refresh/weekly')
  async refreshWeeklyCache() {
    await this.schedulerService.refreshWeeklyLeaderboardCache();
    return { message: 'Weekly leaderboard cache refresh triggered' };
  }

  /**
   * Trigger cleanup expired cache thủ công
   */
  @Post('cache/cleanup')
  async cleanupExpiredCache() {
    await this.schedulerService.cleanupExpiredCache();
    return { message: 'Cache cleanup triggered' };
  }
}
