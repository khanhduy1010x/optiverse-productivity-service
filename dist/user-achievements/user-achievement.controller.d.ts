import { UserAchievementService } from './user-achievement.service';
import { ApiResponse } from 'src/common/api-response';
import { UserAchievementResponse } from './dto/response/UserAchievementResponse.dto';
export declare class UserAchievementController {
    private readonly userAchievementService;
    constructor(userAchievementService: UserAchievementService);
    getMyUnlockedAchievements(req: any): Promise<ApiResponse<any>>;
    getMyLockedAchievements(req: any): Promise<ApiResponse<any>>;
    getAchievementById(id: string): Promise<ApiResponse<UserAchievementResponse>>;
}
