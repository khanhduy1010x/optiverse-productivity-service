import { StreakRepository } from './streak.repository';
import { StreakResponse } from './dto/response/StreakResponse.dto';
import { CreateStreakRequest } from './dto/request/CreateStreakRequest.dto';
import { UpdateStreakRequest } from './dto/request/UpdateStreakRequest.dto';
export declare class StreakService {
    private readonly streakRepository;
    constructor(streakRepository: StreakRepository);
    getStreakByUserID(userId: string): Promise<StreakResponse | null>;
    getStreakByID(streakId: string): Promise<StreakResponse>;
    createStreak(userId: string, createStreakDto: CreateStreakRequest): Promise<StreakResponse>;
    updateStreak(streakId: string, updateStreakDto: UpdateStreakRequest): Promise<StreakResponse>;
    updateStreakByUserId(userId: string, updateStreakDto: UpdateStreakRequest): Promise<StreakResponse>;
    updateLoginStreak(userId: string): Promise<StreakResponse>;
    updateTaskStreak(userId: string): Promise<StreakResponse>;
    updateFlashcardStreak(userId: string): Promise<StreakResponse>;
}
