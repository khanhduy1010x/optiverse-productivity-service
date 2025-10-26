import { Model } from 'mongoose';
import { Streak } from './streak.schema';
import { CreateStreakRequest } from './dto/request/CreateStreakRequest.dto';
import { UpdateStreakRequest } from './dto/request/UpdateStreakRequest.dto';
export declare class StreakRepository {
    private readonly streakModel;
    constructor(streakModel: Model<Streak>);
    getStreakByUserID(userId: string): Promise<Streak | null>;
    getStreakByID(streakId: string): Promise<Streak>;
    createStreak(userId: string, createStreakDto: CreateStreakRequest): Promise<Streak>;
    updateStreak(streakId: string, updateStreakDto: UpdateStreakRequest): Promise<Streak>;
    updateStreakByUserId(userId: string, updateStreakDto: UpdateStreakRequest): Promise<Streak>;
    deleteStreak(streakId: string): Promise<Streak>;
}
