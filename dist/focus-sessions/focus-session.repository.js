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
exports.FocusSessionRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const focus_session_schema_1 = require("./focus-session.schema");
const app_exception_1 = require("../common/exceptions/app.exception");
const error_code_enum_1 = require("../common/exceptions/error-code.enum");
let FocusSessionRepository = class FocusSessionRepository {
    constructor(focusSessionModel) {
        this.focusSessionModel = focusSessionModel;
    }
    async getFocusSessionsByUserID(userId) {
        return await this.focusSessionModel.find({ user_id: new mongoose_2.Types.ObjectId(userId) }).exec();
    }
    async createFocusSession(user_id, createFocusSessionDto) {
        const newFocusSession = new this.focusSessionModel({
            ...createFocusSessionDto,
            user_id: new mongoose_2.Types.ObjectId(user_id),
        });
        return await newFocusSession.save();
    }
    async updateFocusSession(focusSessionId, updateFocusSessionDto) {
        return await this.focusSessionModel
            .findByIdAndUpdate(focusSessionId, updateFocusSessionDto, { new: true })
            .orFail(new app_exception_1.AppException(error_code_enum_1.ErrorCode.NOT_FOUND));
    }
    async deleteFocusSession(focusSessionId) {
        const result = await this.focusSessionModel.deleteOne({ _id: focusSessionId }).exec();
        if (result.deletedCount === 0) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.NOT_FOUND);
        }
    }
};
exports.FocusSessionRepository = FocusSessionRepository;
exports.FocusSessionRepository = FocusSessionRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(focus_session_schema_1.FocusSession.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], FocusSessionRepository);
//# sourceMappingURL=focus-session.repository.js.map