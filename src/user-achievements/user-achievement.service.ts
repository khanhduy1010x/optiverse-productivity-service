import { Injectable } from '@nestjs/common';
import { UserAchievementRepository } from './user-achievement.repository';
import { UserAchievement } from './user-achievement.schema';
import { CreateUserAchievementRequest } from './dto/request/CreateUserAchievementRequest.dto';
import { UpdateUserAchievementRequest } from './dto/request/UpdateUserAchievementRequest.dto';
import { UserAchievementResponse } from './dto/response/UserAchievementResponse.dto';
import { AchievementRepository } from '../achievements/achievement.repository';

@Injectable()
export class UserAchievementService {
  constructor(
    private readonly userAchievementRepository: UserAchievementRepository,
    private readonly achievementRepository: AchievementRepository
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
    
    return {
      total: userAchievements.length,
      achievements: userAchievements
    };
  }

  /**
   * Lấy tất cả thành tựu chưa đạt được của một người dùng
   */
  async getLockedAchievements(userId: string): Promise<any> {
    // Lấy tất cả thành tựu có trong hệ thống
    const allAchievements = await this.achievementRepository.findAll();
    
    // Lấy tất cả thành tựu người dùng đã đạt được
    const userAchievements = await this.userAchievementRepository.getUserAchievements(userId);
    
    // Tạo một Set các ID thành tựu đã đạt được để dễ dàng kiểm tra
    const unlockedAchievementIds = new Set(
      userAchievements.map(ua => {
        // Kiểm tra nếu achievement_id là đối tượng (đã được populate)
        if (ua.achievement_id && typeof ua.achievement_id === 'object' && ua.achievement_id._id) {
          return ua.achievement_id._id.toString();
        }
        // Nếu không, giả định nó là ObjectId
        return ua.achievement_id.toString();
      })
    );
    
    // Lọc ra các thành tựu chưa đạt được
    const lockedAchievements = allAchievements.filter(
      achievement => !unlockedAchievementIds.has(achievement._id.toString())
    );
    
    return {
      total: lockedAchievements.length,
      achievements: lockedAchievements
    };
  }
}
