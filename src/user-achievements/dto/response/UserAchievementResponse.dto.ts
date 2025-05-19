import { UserAchievement } from '../../user-achievement.schema';

export class UserAchievementResponse {
  userAchievement: UserAchievement;

  constructor(userAchievement: UserAchievement) {
    this.userAchievement = userAchievement;
  }
}
