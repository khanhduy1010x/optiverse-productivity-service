import { AchievementType, ConditionTypeEnum } from '../../achievement-type.schema';

export class AchievementTypeResponse {
  id: string;
  achievement_id: string;
  condition_type: ConditionTypeEnum;
  condition_value: number;
  created_at: Date;
  updated_at: Date;

  constructor(achievementType: AchievementType) {
    this.id = achievementType._id.toString();
    this.achievement_id = achievementType.achievement_id.toString();
    this.condition_type = achievementType.condition_type as ConditionTypeEnum;
    this.condition_value = achievementType.condition_value;
    this.created_at = achievementType.created_at;
    this.updated_at = achievementType.updated_at;
  }
} 