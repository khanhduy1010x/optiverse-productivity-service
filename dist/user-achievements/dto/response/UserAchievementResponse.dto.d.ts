import { UserAchievement } from '../../user-achievement.schema';
export declare class UserAchievementResponse {
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
    constructor(userAchievement: UserAchievement);
}
