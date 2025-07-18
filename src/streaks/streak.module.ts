import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Streak, StreakSchema } from './streak.schema';
import { StreakController } from './streak.controller';
import { StreakService } from './streak.service';
import { StreakRepository } from './streak.repository';
import { AchievementModule } from '../achievements/achievement.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Streak.name, schema: StreakSchema }]),
    forwardRef(() => AchievementModule),
  ],
  controllers: [StreakController],
  providers: [StreakService, StreakRepository],
  exports: [StreakService, StreakRepository],
})
export class StreakModule {} 