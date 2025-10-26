import { StreakService } from './streak.service';
import { StreakResponse } from './dto/response/StreakResponse.dto';
import { ApiResponse as ApiResponseWrapper } from 'src/common/api-response';
export declare class StreakController {
    private readonly streakService;
    constructor(streakService: StreakService);
    getUserStreak(req: any): Promise<ApiResponseWrapper<StreakResponse>>;
    updateLoginStreak(req: any): Promise<ApiResponseWrapper<StreakResponse>>;
    updateTaskStreak(req: any): Promise<ApiResponseWrapper<StreakResponse>>;
    updateFlashcardStreak(req: any): Promise<ApiResponseWrapper<StreakResponse>>;
}
