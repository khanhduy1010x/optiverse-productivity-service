import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { LeaderboardRepository } from './leaderboard.repository';
import { GetLeaderboardDto, TimePeriod, RankingMetric } from './dto/request/get-leaderboard.dto';
import { LeaderboardResponseDto, LeaderboardEntryDto } from './dto/response/leaderboard-entry.dto';
import { UserHttpClient } from '../http-axios/user-http.client';
import { LeaderboardSchedulerService } from './leaderboard-scheduler.service';

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);

  constructor(
    private readonly repository: LeaderboardRepository,
    private readonly userHttpClient: UserHttpClient,
    private readonly schedulerService: LeaderboardSchedulerService,
  ) {}

  async getLeaderboard(dto: GetLeaderboardDto): Promise<LeaderboardResponseDto> {
    const { timePeriod = TimePeriod.MONTHLY, metric = RankingMetric.TOTAL_SPENDING, page = 1, limit = 10 } = dto;

    try {
      // Try to get from cache first (only for page 1 with default limit)
      let cachedData: any = null;
      if (page === 1 && limit === 10) {
        cachedData = await this.schedulerService.getCachedLeaderboard(timePeriod, metric);
      }

      let data, total, startDate, endDate;

      if (cachedData && cachedData.data) {
        // Use cached data
        data = cachedData.data.slice(0, limit);
        total = cachedData.data.length;
        startDate = new Date(cachedData.cachedAt);
        endDate = new Date(cachedData.expiresAt);
      } else {
        // Fetch from repository if not cached
        const result = await this.repository.getLeaderboard(
          timePeriod,
          metric,
          page,
          limit,
        );
        data = result.data;
        total = result.total;
        startDate = result.startDate;
        endDate = result.endDate;
      }

      // Fetch user details for each entry
      const userIds = data.map((entry: any) => entry._id);
      let userMap = new Map();

      if (userIds.length > 0) {
        try {
          const users = await this.userHttpClient.getUsersByIds(userIds);
          
          if (users && users.length > 0) {
            // Map by user_id to match entry._id
            userMap = new Map(users.map((u: any) => [u.user_id || u._id, u]));
          }
        } catch (error) {
          // Continue without user data, will show "Unknown User"
        }
      }

      // Build entries with rank
      const entries = data.map((entry: any, index: number) => {
        // Convert entry._id to string for lookup (MongoDB ObjectId → String)
        const userIdKey = entry._id?.toString() || entry._id;
        const user = userMap.get(userIdKey);
        const rank = (page - 1) * limit + index + 1;
        const score = metric === RankingMetric.TOTAL_PRODUCTS ? entry.totalProducts : entry.totalSpending;

        return new LeaderboardEntryDto({
          rank,
          userId: userIdKey,
          userName: user?.full_name || 'Unknown User',
          userAvatar: user?.avatar_url || '',
          totalProducts: entry.totalProducts,
          totalSpending: entry.totalSpending,
          score,
          period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
        });
      });

      return new LeaderboardResponseDto({
        entries,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        timePeriod,
        metric,
      });
    } catch (error) {
      throw new BadRequestException(`Failed to fetch leaderboard: ${error.message}`);
    }
  }

  async getUserRank(userId: string, dto: GetLeaderboardDto) {
    const { timePeriod = TimePeriod.MONTHLY, metric = RankingMetric.TOTAL_SPENDING } = dto;

    try {
      // Validate user exists
      const users = await this.userHttpClient.getUsersByIds([userId]);
      const user = users[0];
      if (!user) {
        throw new BadRequestException('User not found');
      }

      const rankData = await this.repository.getUserLeaderboardRank(userId, timePeriod, metric);

      return {
        userId,
        userName: user.full_name || '',
        userAvatar: user.avatar_url || '',
        rank: rankData.rank,
        totalProducts: rankData.totalProducts,
        totalSpending: rankData.totalSpending,
        score: metric === RankingMetric.TOTAL_PRODUCTS ? rankData.totalProducts : rankData.totalSpending,
        timePeriod,
        metric,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to fetch user rank: ${error.message}`);
    }
  }
}
