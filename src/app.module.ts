import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './common/exceptions/http-exception.filter';
import { LoggerMiddleware } from './common/logger/logger.middleware';
import { AxiosClientModule } from './http-axios/axios-client.module';
import { TagModule } from './tags/tag.module';
import { TaskTagModule } from './task-tags/task-tag.module';
import { TasksModule } from './tasks/task.module';
import { FriendModule } from './friends/friend.module';
import { AchievementModule } from './achievements/achievement.module';
import { FlashcardDeckModule } from './flashcard-decks/flashcard-deck.module';
import { FlashcardModule } from './flashcards/flashcard.module';
import { FocusSessionModule } from './focus-sessions/focus-session.module';
import { NoteFolderModule } from './note-folders/note-folder.module';
import { NoteModule } from './notes/note.module';
import { ReviewSessionModule } from './review_sessions/review-session.module';
import { TaskEventModule } from './task-events/task-event.module';
import { UserAchievementModule } from './user-achievements/user-achievement.module';
import { ShareModule } from './shares/share.module';
import { StreakModule } from './streaks/streak.module';
import { AuthMiddleware } from './midlleware/auth.middleware';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    DatabaseModule,
    AxiosClientModule,
    // Import base modules first
    TagModule,
    TaskTagModule,
    // Import modules with circular dependencies in a specific order
    FriendModule,
    TasksModule,
    AchievementModule,
    UserAchievementModule,
    // Other modules
    FlashcardDeckModule,
    FlashcardModule,
    FocusSessionModule,
    NoteFolderModule,
    NoteModule,
    ReviewSessionModule,
    TaskEventModule,
    TaskTagModule,
    TasksModule,
    UserAchievementModule,
    AxiosClientModule,
    ShareModule,
    StreakModule,
    CloudinaryModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
