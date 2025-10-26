"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAchievementModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const user_achievement_schema_1 = require("./user-achievement.schema");
const user_achievement_controller_1 = require("./user-achievement.controller");
const user_achievement_service_1 = require("./user-achievement.service");
const user_achievement_repository_1 = require("./user-achievement.repository");
const achievement_module_1 = require("../achievement/achievement.module");
let UserAchievementModule = class UserAchievementModule {
};
exports.UserAchievementModule = UserAchievementModule;
exports.UserAchievementModule = UserAchievementModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: user_achievement_schema_1.UserAchievement.name, schema: user_achievement_schema_1.UserAchievementSchema }]),
            (0, common_1.forwardRef)(() => achievement_module_1.AchievementModule),
        ],
        controllers: [user_achievement_controller_1.UserAchievementController],
        providers: [user_achievement_service_1.UserAchievementService, user_achievement_repository_1.UserAchievementRepository],
        exports: [user_achievement_service_1.UserAchievementService, user_achievement_repository_1.UserAchievementRepository],
    })
], UserAchievementModule);
//# sourceMappingURL=user-achievement.module.js.map