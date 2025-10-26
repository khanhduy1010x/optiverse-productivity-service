"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const database_module_1 = require("./database/database.module");
const core_1 = require("@nestjs/core");
const http_exception_filter_1 = require("./common/exceptions/http-exception.filter");
const logger_middleware_1 = require("./common/logger/logger.middleware");
const axios_client_module_1 = require("./http-axios/axios-client.module");
const tag_module_1 = require("./tags/tag.module");
const task_tag_module_1 = require("./task-tags/task-tag.module");
const task_module_1 = require("./tasks/task.module");
const friend_module_1 = require("./friends/friend.module");
const flashcard_deck_module_1 = require("./flashcard-decks/flashcard-deck.module");
const flashcard_module_1 = require("./flashcards/flashcard.module");
const focus_session_module_1 = require("./focus-sessions/focus-session.module");
const note_folder_module_1 = require("./note-folders/note-folder.module");
const note_module_1 = require("./notes/note.module");
const review_session_module_1 = require("./review_sessions/review-session.module");
const task_event_module_1 = require("./task-events/task-event.module");
const share_module_1 = require("./shares/share.module");
const streak_module_1 = require("./streaks/streak.module");
const auth_middleware_1 = require("./midlleware/auth.middleware");
const achievement_evaluation_middleware_1 = require("./midlleware/achievement-evaluation.middleware");
const cloudinary_module_1 = require("./common/cloudinary/cloudinary.module");
const achievement_module_1 = require("./achievement/achievement.module");
const user_inventory_module_1 = require("./user-inventory/user-inventory.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(logger_middleware_1.LoggerMiddleware).forRoutes('*');
        consumer.apply(auth_middleware_1.AuthMiddleware).forRoutes('*');
        consumer.apply(achievement_evaluation_middleware_1.AchievementEvaluationMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                envFilePath: '.env',
                isGlobal: true,
            }),
            database_module_1.DatabaseModule,
            axios_client_module_1.AxiosClientModule,
            tag_module_1.TagModule,
            task_tag_module_1.TaskTagModule,
            friend_module_1.FriendModule,
            task_module_1.TasksModule,
            flashcard_deck_module_1.FlashcardDeckModule,
            flashcard_module_1.FlashcardModule,
            focus_session_module_1.FocusSessionModule,
            note_folder_module_1.NoteFolderModule,
            note_module_1.NoteModule,
            review_session_module_1.ReviewSessionModule,
            task_event_module_1.TaskEventModule,
            task_tag_module_1.TaskTagModule,
            task_module_1.TasksModule,
            axios_client_module_1.AxiosClientModule,
            share_module_1.ShareModule,
            streak_module_1.StreakModule,
            cloudinary_module_1.CloudinaryModule,
            achievement_module_1.AchievementModule,
            user_inventory_module_1.UserInventoryModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            achievement_evaluation_middleware_1.AchievementEvaluationMiddleware,
            {
                provide: core_1.APP_FILTER,
                useClass: http_exception_filter_1.HttpExceptionFilter,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map