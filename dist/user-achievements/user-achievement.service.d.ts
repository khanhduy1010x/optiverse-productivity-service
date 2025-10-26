import { UserAchievementRepository } from './user-achievement.repository';
import { UserAchievementResponse } from './dto/response/UserAchievementResponse.dto';
import { AchievementRepository } from 'src/achievement/achievement.repository';
export declare class UserAchievementService {
    private readonly userAchievementRepository;
    private readonly achievementRepository;
    constructor(userAchievementRepository: UserAchievementRepository, achievementRepository: AchievementRepository);
    getUserAchievements(userId: string): Promise<any>;
    getUserAchievementById(id: string): Promise<UserAchievementResponse>;
    getUnlockedAchievements(userId: string): Promise<any>;
    getLockedAchievements(userId: string): Promise<any>;
}
