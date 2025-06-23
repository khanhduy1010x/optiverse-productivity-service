import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Achievement, AchievementSchema } from './achievement.schema';
import { AchievementController } from './achievement.controller';
import { AchievementService } from './achievement.service';
import { AchievementRepository } from './achievement.repository';
import { AchievementType, AchievementTypeSchema } from '../achievement-type/achievement-type.schema';
import { AchievementTypeRepository } from '../achievement-type/achievement-type.repository';
import { UserAchievement, UserAchievementSchema } from '../user-achievements/user-achievement.schema';
import { UserAchievementRepository } from '../user-achievements/user-achievement.repository';
import { TasksModule } from '../tasks/task.module';
import { AchievementTypeController } from '../achievement-type/achievement-type.controller';
import { AchievementTypeService } from '../achievement-type/achievement-type.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Achievement.name, schema: AchievementSchema },
      { name: AchievementType.name, schema: AchievementTypeSchema },
      { name: UserAchievement.name, schema: UserAchievementSchema },
    ]),
    forwardRef(() => TasksModule),
  ],
  controllers: [AchievementController, AchievementTypeController],
  providers: [
    AchievementService, 
    AchievementRepository,
    AchievementTypeRepository,
    UserAchievementRepository,
    AchievementTypeService,
  ],
  exports: [AchievementService, AchievementRepository],
})
export class AchievementModule {}
