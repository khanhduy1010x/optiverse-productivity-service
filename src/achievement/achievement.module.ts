import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Achievement, AchievementSchema } from './achievement.schema';
import { AchievementController } from './achievement.controller';
import { AchievementService } from './achievement.service';
import { AchievementRepository } from './achievement.repository';
import { Task, TaskSchema } from 'src/tasks/task.schema';
import { Friend, FriendSchema } from 'src/friends/friend.schema';
import { Streak, StreakSchema } from 'src/streaks/streak.schema';
import { UserAchievementModule } from 'src/user-achievements/user-achievement.module';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Achievement.name, schema: AchievementSchema },
      { name: Task.name, schema: TaskSchema },
      { name: Friend.name, schema: FriendSchema },
      { name: Streak.name, schema: StreakSchema },
    ]),
    forwardRef(() => UserAchievementModule),
    CloudinaryModule,
  ],
  controllers: [AchievementController],
  providers: [AchievementService, AchievementRepository],
  exports: [AchievementService, AchievementRepository],
})
export class AchievementModule {}