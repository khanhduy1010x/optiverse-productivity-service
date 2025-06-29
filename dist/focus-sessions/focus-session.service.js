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
exports.FocusSessionService = void 0;
const common_1 = require("@nestjs/common");
const focus_session_repository_1 = require("./focus-session.repository");
const FocusSessionResponse_dto_1 = require("./dto/response/FocusSessionResponse.dto");
let FocusSessionService = class FocusSessionService {
    constructor(focusSessionRepository) {
        this.focusSessionRepository = focusSessionRepository;
    }
    async getFocusSessionsByUserID(userId) {
        return await this.focusSessionRepository.getFocusSessionsByUserID(userId);
    }
    async createFocusSession(user_id, createFocusSessionDto) {
        const focusSession = await this.focusSessionRepository.createFocusSession(user_id, createFocusSessionDto);
        return new FocusSessionResponse_dto_1.FocusSessionResponse(focusSession);
    }
    async updateFocusSession(focusSessionId, updateFocusSessionDto) {
        const focusSession = await this.focusSessionRepository.updateFocusSession(focusSessionId, updateFocusSessionDto);
        return new FocusSessionResponse_dto_1.FocusSessionResponse(focusSession);
    }
    async deleteFocusSession(focusSessionId) {
        return await this.focusSessionRepository.deleteFocusSession(focusSessionId);
    }
};
exports.FocusSessionService = FocusSessionService;
exports.FocusSessionService = FocusSessionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [focus_session_repository_1.FocusSessionRepository])
], FocusSessionService);
//# sourceMappingURL=focus-session.service.js.map