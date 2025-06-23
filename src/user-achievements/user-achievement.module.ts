import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAchievement, UserAchievementSchema } from './user-achievement.schema';
import { UserAchievementController } from './user-achievement.controller';
import { UserAchievementService } from './user-achievement.service';
import { UserAchievementRepository } from './user-achievement.repository';
import { AchievementModule } from '../achievements/achievement.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserAchievement.name, schema: UserAchievementSchema }]),
    AchievementModule,
  ],
  controllers: [UserAchievementController],
  providers: [UserAchievementService, UserAchievementRepository],
  exports: [UserAchievementService, UserAchievementRepository],
})
export class UserAchievementModule {}
