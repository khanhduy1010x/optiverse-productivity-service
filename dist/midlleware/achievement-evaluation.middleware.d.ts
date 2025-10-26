import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AchievementService } from '../achievement/achievement.service';
export declare class AchievementEvaluationMiddleware implements NestMiddleware {
    private readonly achievementService;
    private evaluationQueue;
    constructor(achievementService: AchievementService);
    use(req: Request, res: Response, next: NextFunction): void;
    private evaluateAchievementsAsync;
}
