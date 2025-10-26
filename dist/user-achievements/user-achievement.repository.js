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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAchievementRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_achievement_schema_1 = require("./user-achievement.schema");
const app_exception_1 = require("../common/exceptions/app.exception");
const error_code_enum_1 = require("../common/exceptions/error-code.enum");
let UserAchievementRepository = class UserAchievementRepository {
    constructor(userAchievementModel) {
        this.userAchievementModel = userAchievementModel;
    }
    async getUserAchievements(userId) {
        return this.userAchievementModel
            .find({ user_id: new mongoose_2.Types.ObjectId(userId) })
            .exec();
    }
    async findById(id) {
        return this.userAchievementModel
            .findById(new mongoose_2.Types.ObjectId(id))
            .orFail(new app_exception_1.AppException(error_code_enum_1.ErrorCode.NOT_FOUND))
            .exec();
    }
    async checkUserHasAchievement(userId, achievementId) {
        const count = await this.userAchievementModel.countDocuments({
            user_id: new mongoose_2.Types.ObjectId(userId),
            achievement_id: achievementId,
        });
        return count > 0;
    }
    async createUserAchievement(userId, achievementId) {
        const newUserAchievement = new this.userAchievementModel({
            user_id: new mongoose_2.Types.ObjectId(userId),
            achievement_id: achievementId,
            unlocked_at: new Date(),
        });
        return newUserAchievement.save();
    }
    async createManyUserAchievements(userId, achievementIds) {
        const userAchievements = achievementIds.map(achievementId => ({
            user_id: new mongoose_2.Types.ObjectId(userId),
            achievement_id: achievementId,
            unlocked_at: new Date(),
        }));
        return this.userAchievementModel.insertMany(userAchievements);
    }
    async deleteByAchievementId(achievementId) {
        const result = await this.userAchievementModel.deleteMany({
            achievement_id: achievementId
        }).exec();
        console.log(`Deleted ${result.deletedCount} user achievements for achievement: ${achievementId}`);
    }
};
exports.UserAchievementRepository = UserAchievementRepository;
exports.UserAchievementRepository = UserAchievementRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_achievement_schema_1.UserAchievement.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UserAchievementRepository);
//# sourceMappingURL=user-achievement.repository.js.map