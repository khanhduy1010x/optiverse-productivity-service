import { Model } from 'mongoose';
import { UserAchievement } from './user-achievement.schema';
export declare class UserAchievementRepository {
    private readonly userAchievementModel;
    constructor(userAchievementModel: Model<UserAchievement>);
    getUserAchievements(userId: string): Promise<UserAchievement[]>;
    findById(id: string): Promise<UserAchievement>;
    checkUserHasAchievement(userId: string, achievementId: string): Promise<boolean>;
    createUserAchievement(userId: string, achievementId: string): Promise<UserAchievement>;
    createManyUserAchievements(userId: string, achievementIds: string[]): Promise<UserAchievement[]>;
    deleteByAchievementId(achievementId: string): Promise<void>;
}
