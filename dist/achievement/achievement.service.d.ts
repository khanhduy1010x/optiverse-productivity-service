import { Model } from 'mongoose';
import { Achievement } from './achievement.schema';
import { AchievementRepository } from './achievement.repository';
import { Task } from 'src/tasks/task.schema';
import { Friend } from 'src/friends/friend.schema';
import { Streak } from 'src/streaks/streak.schema';
import { UserAchievementRepository } from 'src/user-achievements/user-achievement.repository';
export interface EvaluationResult {
    achievementId: string;
    unlocked: boolean;
    details: {
        ruleIndex: number;
        count: number;
        threshold: number;
        passed: boolean;
        dateInfo?: {
            currentTime: string;
            conditionValue: string;
            calculatedRange?: {
                start: string;
                end: string;
            };
        };
    }[];
}
export declare class AchievementService {
    private readonly achievementRepository;
    private readonly taskModel;
    private readonly friendModel;
    private readonly streakModel;
    private readonly userAchievementRepository;
    constructor(achievementRepository: AchievementRepository, taskModel: Model<Task>, friendModel: Model<Friend>, streakModel: Model<Streak>, userAchievementRepository: UserAchievementRepository);
    getAllAchievements(): Promise<Achievement[]>;
    evaluateForUser(userId: string): Promise<{
        unlocked: string[];
        locked: string[];
        results: EvaluationResult[];
        newlyUnlocked: string[];
    }>;
    private evaluateAchievement;
    private countByRule;
    private buildFieldFilter;
    private getDateRange;
    private compare;
}
