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
exports.AchievementRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const achievement_schema_1 = require("./achievement.schema");
const app_exception_1 = require("../common/exceptions/app.exception");
const error_code_enum_1 = require("../common/exceptions/error-code.enum");
const user_achievement_repository_1 = require("../user-achievements/user-achievement.repository");
let AchievementRepository = class AchievementRepository {
    constructor(achievementModel, userAchievementRepository) {
        this.achievementModel = achievementModel;
        this.userAchievementRepository = userAchievementRepository;
    }
    async getAll() {
        return this.achievementModel.find().exec();
    }
    async findById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.INVALID_OBJECT_ID);
        }
        return this.achievementModel
            .findById(new mongoose_2.Types.ObjectId(id))
            .orFail(new app_exception_1.AppException(error_code_enum_1.ErrorCode.NOT_FOUND))
            .exec();
    }
    async create(dto) {
        const created = new this.achievementModel(dto);
        return created.save();
    }
    async update(id, dto) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.INVALID_OBJECT_ID);
        }
        return this.achievementModel
            .findByIdAndUpdate(new mongoose_2.Types.ObjectId(id), dto, { new: true })
            .orFail(new app_exception_1.AppException(error_code_enum_1.ErrorCode.NOT_FOUND))
            .exec();
    }
    async delete(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.INVALID_OBJECT_ID);
        }
        await this.userAchievementRepository.deleteByAchievementId(id);
        const res = await this.achievementModel.deleteOne({ _id: new mongoose_2.Types.ObjectId(id) }).exec();
        if (res.deletedCount === 0) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.NOT_FOUND);
        }
    }
};
exports.AchievementRepository = AchievementRepository;
exports.AchievementRepository = AchievementRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(achievement_schema_1.Achievement.name)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => user_achievement_repository_1.UserAchievementRepository))),
    __metadata("design:paramtypes", [mongoose_2.Model,
        user_achievement_repository_1.UserAchievementRepository])
], AchievementRepository);
//# sourceMappingURL=achievement.repository.js.map