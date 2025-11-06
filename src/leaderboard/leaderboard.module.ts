import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { PurchaseHistory, PurchaseHistorySchema } from '../purchase-history/purchase-history.schema';
import { LeaderboardCache, LeaderboardCacheSchema } from './leaderboard-cache.schema';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardCacheController } from './leaderboard-cache.controller';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardRepository } from './leaderboard.repository';
import { LeaderboardSchedulerService } from './leaderboard-scheduler.service';
import { AxiosClientModule } from '../http-axios/axios-client.module';
import { UserHttpClient } from '../http-axios/user-http.client';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: PurchaseHistory.name, schema: PurchaseHistorySchema },
      { name: LeaderboardCache.name, schema: LeaderboardCacheSchema },
    ]),
    AxiosClientModule,
  ],
  controllers: [LeaderboardController, LeaderboardCacheController],
  providers: [LeaderboardService, LeaderboardRepository, LeaderboardSchedulerService, UserHttpClient],
  exports: [LeaderboardService, LeaderboardSchedulerService],
})
export class LeaderboardModule {}
