import { Achievement } from '../../achievement.schema';

export class AchievementResponse {
  achievement: Achievement;

  constructor(achievement: Achievement) {
    this.achievement = achievement;
  }
}
