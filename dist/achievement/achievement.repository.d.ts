import { Model } from 'mongoose';
import { Achievement } from './achievement.schema';
import { CreateAchievementRequest } from './dto/request/CreateAchievementRequest.dto';
import { UpdateAchievementRequest } from './dto/request/UpdateAchievementRequest.dto';
import { UserAchievementRepository } from 'src/user-achievements/user-achievement.repository';
export declare class AchievementRepository {
    private readonly achievementModel;
    private readonly userAchievementRepository;
    constructor(achievementModel: Model<Achievement>, userAchievementRepository: UserAchievementRepository);
    getAll(): Promise<Achievement[]>;
    findById(id: string): Promise<Achievement>;
    create(dto: CreateAchievementRequest): Promise<Achievement>;
    update(id: string, dto: UpdateAchievementRequest): Promise<Achievement>;
    delete(id: string): Promise<void>;
}
