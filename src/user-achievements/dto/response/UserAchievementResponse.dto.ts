import { UserAchievement } from '../../user-achievement.schema';
import { Achievement } from '../../../achievements/achievement.schema';

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
    
    // Kiểm tra xem achievement_id có được populate không
    if (userAchievement.achievement_id && typeof userAchievement.achievement_id !== 'string') {
      const achievement = userAchievement.achievement_id as unknown as Achievement;
      this.achievement = {
        id: achievement._id.toString(),
        title: achievement.title,
        description: achievement.description || '',
        icon_url: achievement.icon_url || '',
      };
    } else {
      this.achievement = {
        id: typeof userAchievement.achievement_id === 'string' 
          ? userAchievement.achievement_id 
          : (userAchievement.achievement_id as any)?.toString() || 'unknown',
        title: 'Unknown Achievement',
        description: '',
        icon_url: '',
      };
    }
    
    this.unlocked_at = userAchievement.unlocked_at;
    this.created_at = userAchievement.created_at;
    this.updated_at = userAchievement.updated_at;
  }
}
