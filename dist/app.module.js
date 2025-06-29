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
const achievement_module_1 = require("./achievements/achievement.module");
const flashcard_deck_module_1 = require("./flashcard-decks/flashcard-deck.module");
const flashcard_module_1 = require("./flashcards/flashcard.module");
const focus_session_module_1 = require("./focus-sessions/focus-session.module");
const friend_module_1 = require("./friends/friend.module");
const note_folder_module_1 = require("./note-folders/note-folder.module");
const note_module_1 = require("./notes/note.module");
const review_session_module_1 = require("./review_sessions/review-session.module");
const tag_module_1 = require("./tags/tag.module");
const task_event_module_1 = require("./task-events/task-event.module");
const task_tag_module_1 = require("./task-tags/task-tag.module");
const task_module_1 = require("./tasks/task.module");
const user_achievement_module_1 = require("./user-achievements/user-achievement.module");
const axios_client_module_1 = require("./http-axios/axios-client.module");
const share_module_1 = require("./shares/share.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(logger_middleware_1.LoggerMiddleware).forRoutes('*');
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
            achievement_module_1.AchievementModule,
            flashcard_deck_module_1.FlashcardDeckModule,
            flashcard_module_1.FlashcardModule,
            focus_session_module_1.FocusSessionModule,
            friend_module_1.FriendModule,
            note_folder_module_1.NoteFolderModule,
            note_module_1.NoteModule,
            review_session_module_1.ReviewSessionModule,
            tag_module_1.TagModule,
            task_event_module_1.TaskEventModule,
            task_tag_module_1.TaskTagModule,
            task_module_1.TasksModule,
            user_achievement_module_1.UserAchievementModule,
            axios_client_module_1.AxiosClientModule,
            share_module_1.ShareModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_FILTER,
                useClass: http_exception_filter_1.HttpExceptionFilter,
            },
            app_service_1.AppService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map