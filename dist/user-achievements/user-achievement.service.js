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
exports.UserAchievementService = void 0;
const common_1 = require("@nestjs/common");
const user_achievement_repository_1 = require("./user-achievement.repository");
const UserAchievementResponse_dto_1 = require("./dto/response/UserAchievementResponse.dto");
const achievement_repository_1 = require("../achievement/achievement.repository");
let UserAchievementService = class UserAchievementService {
    constructor(userAchievementRepository, achievementRepository) {
        this.userAchievementRepository = userAchievementRepository;
        this.achievementRepository = achievementRepository;
    }
    async getUserAchievements(userId) {
        const userAchievements = await this.userAchievementRepository.getUserAchievements(userId);
        return {
            total: userAchievements.length,
            achievements: userAchievements
        };
    }
    async getUserAchievementById(id) {
        const userAchievement = await this.userAchievementRepository.findById(id);
        return new UserAchievementResponse_dto_1.UserAchievementResponse(userAchievement);
    }
    async getUnlockedAchievements(userId) {
        const userAchievements = await this.userAchievementRepository.getUserAchievements(userId);
        const unlockedWithDetails = await Promise.all(userAchievements.map(async (ua) => {
            const achievement = await this.achievementRepository.findById(ua.achievement_id);
            return {
                id: ua._id.toString(),
                user_id: ua.user_id.toString(),
                achievement: {
                    id: achievement._id.toString(),
                    title: achievement.title,
                    description: achievement.description || '',
                    icon_url: achievement.icon_url || '',
                    reward: achievement.reward || '',
                },
                unlocked_at: ua.unlocked_at
            };
        }));
        return {
            total: unlockedWithDetails.length,
            achievements: unlockedWithDetails
        };
    }
    async getLockedAchievements(userId) {
        const [allAchievements, userAchievements] = await Promise.all([
            this.achievementRepository.getAll(),
            this.userAchievementRepository.getUserAchievements(userId),
        ]);
        const unlockedIds = new Set(userAchievements.map(ua => ua.achievement_id));
        const lockedAchievements = allAchievements.filter(a => !unlockedIds.has(a._id.toString()));
        const locked = lockedAchievements.map(achievement => ({
            id: null,
            user_id: userId,
            achievement: {
                id: achievement._id.toString(),
                title: achievement.title,
                description: achievement.description,
                icon_url: achievement.icon_url,
                reward: achievement.reward || '',
            },
            unlocked_at: null,
        }));
        return {
            total: locked.length,
            achievements: locked,
        };
    }
};
exports.UserAchievementService = UserAchievementService;
exports.UserAchievementService = UserAchievementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_achievement_repository_1.UserAchievementRepository,
        achievement_repository_1.AchievementRepository])
], UserAchievementService);
//# sourceMappingURL=user-achievement.service.js.map