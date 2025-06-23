import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './common/exceptions/http-exception.filter';
import { LoggerMiddleware } from './common/logger/logger.middleware';
import { AchievementModule } from './achievements/achievement.module';
import { FlashcardDeckModule } from './flashcard-decks/flashcard-deck.module';
import { FlashcardModule } from './flashcards/flashcard.module';
import { FocusSessionModule } from './focus-sessions/focus-session.module';
import { FriendModule } from './friends/friend.module';
import { NoteFolderModule } from './note-folders/note-folder.module';
import { NoteModule } from './notes/note.module';
import { ReviewSessionModule } from './review_sessions/review-session.module';
import { TagModule } from './tags/tag.module';
import { TaskEventModule } from './task-events/task-event.module';
import { TaskTagModule } from './task-tags/task-tag.module';
import { TasksModule } from './tasks/task.module';
import { UserAchievementModule } from './user-achievements/user-achievement.module';
import { AxiosClientModule } from './http-axios/axios-client.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    DatabaseModule,
    AchievementModule,
    FlashcardDeckModule,
    FlashcardModule,
    FocusSessionModule,
    FriendModule,
    NoteFolderModule,
    NoteModule,
    ReviewSessionModule,
    TagModule,
    TaskEventModule,
    TaskTagModule,
    TasksModule,
    UserAchievementModule,
    AxiosClientModule

  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    AppService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
