"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AchievementEvaluationMiddleware = void 0;
const common_1 = require("@nestjs/common");
const achievement_service_1 = require("../achievement/achievement.service");
let AchievementEvaluationMiddleware = class AchievementEvaluationMiddleware {
    constructor(achievementService) {
        this.achievementService = achievementService;
        this.evaluationQueue = new Set();
    }
    use(req, res, next) {
        const customReq = req;
        const shouldEvaluate = customReq.userInfo?.userId &&
            !req.originalUrl.includes('/achievement') &&
            !req.originalUrl.includes('/user-achievement') &&
            req.method !== 'GET';
        if (shouldEvaluate) {
            res.on('finish', () => {
                setTimeout(() => {
                    this.evaluateAchievementsAsync(customReq.userInfo.userId);
                }, 100);
            });
        }
        next();
    }
    async evaluateAchievementsAsync(userId) {
        if (this.evaluationQueue.has(userId)) {
            console.log(`Achievement evaluation already in progress for user: ${userId}`);
            return;
        }
        try {
            this.evaluationQueue.add(userId);
            await this.achievementService.evaluateForUser(userId);
            console.log(`Achievement evaluation completed for user: ${userId}`);
        }
        catch (error) {
            console.error(`Achievement evaluation failed for user ${userId}:`, error);
        }
        finally {
            this.evaluationQueue.delete(userId);
        }
    }
};
exports.AchievementEvaluationMiddleware = AchievementEvaluationMiddleware;
exports.AchievementEvaluationMiddleware = AchievementEvaluationMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [achievement_service_1.AchievementService])
], AchievementEvaluationMiddleware);
//# sourceMappingURL=achievement-evaluation.middleware.js.map