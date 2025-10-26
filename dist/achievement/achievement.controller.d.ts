import { AchievementService } from './achievement.service';
import { AchievementRepository } from './achievement.repository';
import { CreateAchievementRequest } from './dto/request/CreateAchievementRequest.dto';
import { UpdateAchievementRequest } from './dto/request/UpdateAchievementRequest.dto';
import { AchievementResponse } from './dto/response/AchievementResponse.dto';
import { ApiResponse as ApiResponseWrapper } from 'src/common/api-response';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { UserInventoryService } from 'src/user-inventory/user-inventory.service';
export declare class AchievementController {
    private readonly achievementService;
    private readonly achievementRepository;
    private readonly cloudinaryService;
    private readonly userInventoryService;
    constructor(achievementService: AchievementService, achievementRepository: AchievementRepository, cloudinaryService: CloudinaryService, userInventoryService: UserInventoryService);
    private isEnumValue;
    private parseRulesInput;
    private validateRule;
    private validateCreateDto;
    private validateUpdateDto;
    getAll(): Promise<ApiResponseWrapper<AchievementResponse[]>>;
    getById(id: string): Promise<ApiResponseWrapper<AchievementResponse>>;
    create(files: {
        file?: Express.Multer.File[];
        icon_file?: Express.Multer.File[];
    }, createAchievementDto: CreateAchievementRequest): Promise<ApiResponseWrapper<AchievementResponse>>;
    update(id: string, files: {
        file?: Express.Multer.File[];
        icon_file?: Express.Multer.File[];
    }, updateAchievementDto: UpdateAchievementRequest): Promise<ApiResponseWrapper<AchievementResponse>>;
    delete(id: string): Promise<ApiResponseWrapper<true>>;
    evaluateForCurrentUser(req: any): Promise<ApiResponseWrapper<{
        unlocked: string[];
        locked: string[];
        results: import("./achievement.service").EvaluationResult[];
        newlyUnlocked: string[];
    }>>;
}
