import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Achievement, AchievementSchema } from './achievement.schema';
import { AchievementController } from './achievement.controller';
import { AchievementService } from './achievement.service';
import { AchievementRepository } from './achievement.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: Achievement.name, schema: AchievementSchema }])],
  controllers: [AchievementController],
  providers: [AchievementService, AchievementRepository],
  exports: [AchievementService],
})
export class AchievementModule {}
