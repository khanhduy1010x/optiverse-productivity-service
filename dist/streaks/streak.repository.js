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
exports.StreakRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const streak_schema_1 = require("./streak.schema");
const app_exception_1 = require("../common/exceptions/app.exception");
const error_code_enum_1 = require("../common/exceptions/error-code.enum");
let StreakRepository = class StreakRepository {
    constructor(streakModel) {
        this.streakModel = streakModel;
    }
    async getStreakByUserID(userId) {
        return await this.streakModel
            .findOne({ user_id: new mongoose_2.Types.ObjectId(userId) })
            .exec();
    }
    async getStreakByID(streakId) {
        return await this.streakModel
            .findById(new mongoose_2.Types.ObjectId(streakId))
            .orFail(new app_exception_1.AppException(error_code_enum_1.ErrorCode.NOT_FOUND));
    }
    async createStreak(userId, createStreakDto) {
        const newStreak = new this.streakModel({
            ...createStreakDto,
            user_id: new mongoose_2.Types.ObjectId(userId),
            created_at: new Date(),
            updated_at: new Date(),
        });
        return await newStreak.save();
    }
    async updateStreak(streakId, updateStreakDto) {
        return await this.streakModel
            .findByIdAndUpdate(new mongoose_2.Types.ObjectId(streakId), updateStreakDto, { new: true })
            .orFail(new app_exception_1.AppException(error_code_enum_1.ErrorCode.NOT_FOUND));
    }
    async updateStreakByUserId(userId, updateStreakDto) {
        return await this.streakModel
            .findOneAndUpdate({ user_id: new mongoose_2.Types.ObjectId(userId) }, updateStreakDto, { new: true })
            .orFail(new app_exception_1.AppException(error_code_enum_1.ErrorCode.NOT_FOUND));
    }
    async deleteStreak(streakId) {
        const streak = await this.streakModel.findByIdAndDelete(streakId).exec();
        if (!streak) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.NOT_FOUND);
        }
        return streak;
    }
};
exports.StreakRepository = StreakRepository;
exports.StreakRepository = StreakRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(streak_schema_1.Streak.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], StreakRepository);
//# sourceMappingURL=streak.repository.js.map