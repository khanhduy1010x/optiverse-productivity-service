import { Types } from 'mongoose';
export declare class CreateUserAchievementRequest {
    user_id: Types.ObjectId;
    achievement_id: Types.ObjectId;
    achieved_at?: Date;
}
