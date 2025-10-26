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
exports.StreakController = void 0;
const common_1 = require("@nestjs/common");
const streak_service_1 = require("./streak.service");
const StreakResponse_dto_1 = require("./dto/response/StreakResponse.dto");
const api_response_1 = require("../common/api-response");
const swagger_1 = require("@nestjs/swagger");
let StreakController = class StreakController {
    constructor(streakService) {
        this.streakService = streakService;
    }
    async getUserStreak(req) {
        const user = req.userInfo;
        const streak = await this.streakService.getStreakByUserID(user.userId);
        return new api_response_1.ApiResponse(streak);
    }
    async updateLoginStreak(req) {
        const user = req.userInfo;
        const streak = await this.streakService.updateLoginStreak(user.userId);
        return new api_response_1.ApiResponse(streak);
    }
    async updateTaskStreak(req) {
        const user = req.userInfo;
        const streak = await this.streakService.updateTaskStreak(user.userId);
        return new api_response_1.ApiResponse(streak);
    }
    async updateFlashcardStreak(req) {
        const user = req.userInfo;
        const streak = await this.streakService.updateFlashcardStreak(user.userId);
        return new api_response_1.ApiResponse(streak);
    }
};
exports.StreakController = StreakController;
__decorate([
    (0, common_1.Get)('user'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StreakController.prototype, "getUserStreak", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StreakController.prototype, "updateLoginStreak", null);
__decorate([
    (0, common_1.Post)('task'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StreakController.prototype, "updateTaskStreak", null);
__decorate([
    (0, common_1.Post)('flashcard'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StreakController.prototype, "updateFlashcardStreak", null);
exports.StreakController = StreakController = __decorate([
    (0, swagger_1.ApiTags)('Streak'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiExtraModels)(api_response_1.ApiResponse, StreakResponse_dto_1.StreakResponse),
    (0, common_1.Controller)('/streak'),
    __metadata("design:paramtypes", [streak_service_1.StreakService])
], StreakController);
//# sourceMappingURL=streak.controller.js.map