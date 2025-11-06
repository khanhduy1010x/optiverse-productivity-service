import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { GetLeaderboardDto } from './dto/request/get-leaderboard.dto';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly service: LeaderboardService) {}

  @Get()
  async getLeaderboard(@Query() query: GetLeaderboardDto) {
    return this.service.getLeaderboard(query);
  }

  @Get('user/:userId')
  async getUserRank(
    @Param('userId') userId: string,
    @Query() query: GetLeaderboardDto,
  ) {
    return this.service.getUserRank(userId, query);
  }
}
