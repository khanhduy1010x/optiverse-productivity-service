import { Injectable } from '@nestjs/common';
import { UserAchievementRepository } from './user-achievement.repository';
import { UserAchievement } from './user-achievement.schema';
import { CreateUserAchievementRequest } from './dto/request/CreateUserAchievementRequest.dto';
import { UpdateUserAchievementRequest } from './dto/request/UpdateUserAchievementRequest.dto';
import { UserAchievementResponse } from './dto/response/UserAchievementResponse.dto';
import { AchievementRepository } from 'src/achievement/achievement.repository';
import { AchievementResponse } from 'src/achievement/dto/response/AchievementResponse.dto';

@Injectable()
export class UserAchievementService {
  constructor(
    private readonly userAchievementRepository: UserAchievementRepository,
    private readonly achievementRepository: AchievementRepository,
  ) {}

  /**
   * Lấy tất cả thành tựu của một người dùng (đã đạt được)
   */
  async getUserAchievements(userId: string): Promise<any> {
    const userAchievements = await this.userAchievementRepository.getUserAchievements(userId);
    
    return {
      total: userAchievements.length,
      achievements: userAchievements
    };
  }

  /**
   * Lấy chi tiết một thành tựu cụ thể của người dùng
   */
  async getUserAchievementById(id: string): Promise<UserAchievementResponse> {
    const userAchievement = await this.userAchievementRepository.findById(id);
    return new UserAchievementResponse(userAchievement);
  }

  /**
   * Lấy tất cả thành tựu đã đạt được của một người dùng
   */
  async getUnlockedAchievements(userId: string): Promise<any> {
    const userAchievements = await this.userAchievementRepository.getUserAchievements(userId);
    
    // Lấy thông tin chi tiết của từng achievement
    const unlockedWithDetails = await Promise.all(
      userAchievements.map(async (ua) => {
        const achievement = await this.achievementRepository.findById(ua.achievement_id);
        return {
          id: ua._id.toString(),
          user_id: ua.user_id.toString(),
          achievement: {
            id: achievement._id.toString(),
            title: achievement.title,
            description: achievement.description || '',
            icon_url: achievement.icon_url || '',
            reward: achievement.reward || '',
          },
          unlocked_at: ua.unlocked_at
        };
      })
    );
    
    return {
      total: unlockedWithDetails.length,
      achievements: unlockedWithDetails
    };
  }

  /**
   * Lấy tất cả thành tựu chưa đạt được của một người dùng
   */
  async getLockedAchievements(userId: string): Promise<any> {
    // Lấy toàn bộ achievements và danh sách achievements đã unlock của user
    const [allAchievements, userAchievements] = await Promise.all([
      this.achievementRepository.getAll(),
      this.userAchievementRepository.getUserAchievements(userId),
    ]);

    const unlockedIds = new Set<string>(userAchievements.map(ua => ua.achievement_id));
    const lockedAchievements = allAchievements.filter(a => !unlockedIds.has(a._id.toString()));

    // Map locked achievements to consistent structure with unlocked
    const locked = lockedAchievements.map(achievement => ({
      id: null, // No user achievement record for locked 
      user_id: userId,
      achievement: {
        id: achievement._id.toString(),
        title: achievement.title,
        description: achievement.description,
        icon_url: achievement.icon_url,
        reward: achievement.reward || '',
      },
      unlocked_at: null, // Not unlocked yet 
     
    }));

    return {
      total: locked.length,
      achievements: locked,
    };
  }
}