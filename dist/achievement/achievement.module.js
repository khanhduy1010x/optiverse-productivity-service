"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AchievementModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const achievement_schema_1 = require("./achievement.schema");
const achievement_controller_1 = require("./achievement.controller");
const achievement_service_1 = require("./achievement.service");
const achievement_repository_1 = require("./achievement.repository");
const task_schema_1 = require("../tasks/task.schema");
const friend_schema_1 = require("../friends/friend.schema");
const streak_schema_1 = require("../streaks/streak.schema");
const user_achievement_module_1 = require("../user-achievements/user-achievement.module");
const user_inventory_module_1 = require("../user-inventory/user-inventory.module");
const cloudinary_module_1 = require("../common/cloudinary/cloudinary.module");
let AchievementModule = class AchievementModule {
};
exports.AchievementModule = AchievementModule;
exports.AchievementModule = AchievementModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: achievement_schema_1.Achievement.name, schema: achievement_schema_1.AchievementSchema },
                { name: task_schema_1.Task.name, schema: task_schema_1.TaskSchema },
                { name: friend_schema_1.Friend.name, schema: friend_schema_1.FriendSchema },
                { name: streak_schema_1.Streak.name, schema: streak_schema_1.StreakSchema },
            ]),
            (0, common_1.forwardRef)(() => user_achievement_module_1.UserAchievementModule),
            user_inventory_module_1.UserInventoryModule,
            cloudinary_module_1.CloudinaryModule,
        ],
        controllers: [achievement_controller_1.AchievementController],
        providers: [achievement_service_1.AchievementService, achievement_repository_1.AchievementRepository],
        exports: [achievement_service_1.AchievementService, achievement_repository_1.AchievementRepository],
    })
], AchievementModule);
//# sourceMappingURL=achievement.module.js.map