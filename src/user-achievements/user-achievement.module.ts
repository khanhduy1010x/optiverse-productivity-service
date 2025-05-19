import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAchievement, UserAchievementSchema } from './user-achievement.schema';
import { UserAchievementController } from './user-achievement.controller';
import { UserAchievementService } from './user-achievement.service';
import { UserAchievementRepository } from './user-achievement.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserAchievement.name, schema: UserAchievementSchema }]),
  ],
  controllers: [UserAchievementController],
  providers: [UserAchievementService, UserAchievementRepository],
  exports: [UserAchievementService],
})
export class UserAchievementModule {}
