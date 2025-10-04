import { UserAchievement } from '../../user-achievement.schema';

export class UserAchievementResponse {
  id: string;
  user_id: string;
  achievement: {
    id: string;
    title: string;
    description: string;
    icon_url: string;
  };
  unlocked_at: Date;
  created_at: Date;
  updated_at: Date;

  constructor(userAchievement: UserAchievement) {
    this.id = userAchievement._id.toString();
    this.user_id = userAchievement.user_id.toString();
    
    // achievement_id giờ là string
    this.achievement = {
      id: userAchievement.achievement_id,
      title: 'Achievement',
      description: '',
      icon_url: '',
    };
    
    this.unlocked_at = userAchievement.unlocked_at;
  }
}