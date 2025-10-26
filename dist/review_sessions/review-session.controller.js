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
exports.ReviewSessionController = void 0;
const common_1 = require("@nestjs/common");
const review_session_service_1 = require("./review-session.service");
const api_response_1 = require("../common/api-response");
const ReviewSessionResponse_dto_1 = require("./dto/response/ReviewSessionResponse.dto");
const ReviewRequest_dto_1 = require("./dto/request/ReviewRequest.dto");
const swagger_1 = require("@nestjs/swagger");
let ReviewSessionController = class ReviewSessionController {
    constructor(reviewSessionService) {
        this.reviewSessionService = reviewSessionService;
    }
    async reviewFlashcard(req, dto) {
        const user = req.userInfo;
        const userId = user.userId;
        const result = await this.reviewSessionService.reviewFlashcard(userId, dto);
        return new api_response_1.ApiResponse(result);
    }
    async getReviewSessionsByUserID(req) {
        const user = req.userInfo;
        const userId = user.userId;
        const sessions = await this.reviewSessionService.getReviewSessionsByUserID(userId);
        const result = sessions.map((s) => new ReviewSessionResponse_dto_1.ReviewSessionResponse(s));
        return new api_response_1.ApiResponse(result);
    }
};
exports.ReviewSessionController = ReviewSessionController;
__decorate([
    (0, common_1.Post)('review'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ReviewRequest_dto_1.ReviewRequestDto]),
    __metadata("design:returntype", Promise)
], ReviewSessionController.prototype, "reviewFlashcard", null);
__decorate([
    (0, common_1.Get)('user'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReviewSessionController.prototype, "getReviewSessionsByUserID", null);
exports.ReviewSessionController = ReviewSessionController = __decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('/review-session'),
    __metadata("design:paramtypes", [review_session_service_1.ReviewSessionService])
], ReviewSessionController);
//# sourceMappingURL=review-session.controller.js.map