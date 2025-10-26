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
exports.StreakService = void 0;
const common_1 = require("@nestjs/common");
const streak_repository_1 = require("./streak.repository");
const StreakResponse_dto_1 = require("./dto/response/StreakResponse.dto");
let StreakService = class StreakService {
    constructor(streakRepository) {
        this.streakRepository = streakRepository;
    }
    async getStreakByUserID(userId) {
        const streak = await this.streakRepository.getStreakByUserID(userId);
        if (!streak)
            return null;
        return new StreakResponse_dto_1.StreakResponse(streak);
    }
    async getStreakByID(streakId) {
        const streak = await this.streakRepository.getStreakByID(streakId);
        return new StreakResponse_dto_1.StreakResponse(streak);
    }
    async createStreak(userId, createStreakDto) {
        const streak = await this.streakRepository.createStreak(userId, createStreakDto);
        return new StreakResponse_dto_1.StreakResponse(streak);
    }
    async updateStreak(streakId, updateStreakDto) {
        const streak = await this.streakRepository.updateStreak(streakId, updateStreakDto);
        return new StreakResponse_dto_1.StreakResponse(streak);
    }
    async updateStreakByUserId(userId, updateStreakDto) {
        const streak = await this.streakRepository.updateStreakByUserId(userId, updateStreakDto);
        return new StreakResponse_dto_1.StreakResponse(streak);
    }
    async updateLoginStreak(userId) {
        let streak = await this.streakRepository.getStreakByUserID(userId);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const updateData = {
            lastLoginDate: new Date()
        };
        if (!streak) {
            return await this.createStreak(userId, {
                loginStreak: 1,
                lastLoginDate: new Date()
            });
        }
        if (!streak.lastLoginDate) {
            updateData.loginStreak = 1;
        }
        else {
            const lastLogin = new Date(streak.lastLoginDate);
            lastLogin.setHours(0, 0, 0, 0);
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastLogin.getTime() === yesterday.getTime()) {
                updateData.loginStreak = (streak.loginStreak || 0) + 1;
            }
            else if (lastLogin.getTime() !== today.getTime()) {
                updateData.loginStreak = 1;
            }
        }
        return await this.updateStreakByUserId(userId, updateData);
    }
    async updateTaskStreak(userId) {
        let streak = await this.streakRepository.getStreakByUserID(userId);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const updateData = {
            lastTaskDate: new Date()
        };
        if (!streak) {
            return await this.createStreak(userId, {
                taskStreak: 1,
                lastTaskDate: new Date()
            });
        }
        if (!streak.lastTaskDate) {
            updateData.taskStreak = 1;
        }
        else {
            const lastTask = new Date(streak.lastTaskDate);
            lastTask.setHours(0, 0, 0, 0);
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastTask.getTime() === yesterday.getTime()) {
                updateData.taskStreak = (streak.taskStreak || 0) + 1;
            }
            else if (lastTask.getTime() !== today.getTime()) {
                updateData.taskStreak = 1;
            }
        }
        return await this.updateStreakByUserId(userId, updateData);
    }
    async updateFlashcardStreak(userId) {
        let streak = await this.streakRepository.getStreakByUserID(userId);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const updateData = {
            lastFlashcardDate: new Date()
        };
        if (!streak) {
            return await this.createStreak(userId, {
                flashcardStreak: 1,
                lastFlashcardDate: new Date()
            });
        }
        if (!streak.lastFlashcardDate) {
            updateData.flashcardStreak = 1;
        }
        else {
            const lastFlashcard = new Date(streak.lastFlashcardDate);
            lastFlashcard.setHours(0, 0, 0, 0);
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastFlashcard.getTime() === yesterday.getTime()) {
                updateData.flashcardStreak = (streak.flashcardStreak || 0) + 1;
            }
            else if (lastFlashcard.getTime() !== today.getTime()) {
                updateData.flashcardStreak = 1;
            }
        }
        return await this.updateStreakByUserId(userId, updateData);
    }
};
exports.StreakService = StreakService;
exports.StreakService = StreakService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [streak_repository_1.StreakRepository])
], StreakService);
//# sourceMappingURL=streak.service.js.map