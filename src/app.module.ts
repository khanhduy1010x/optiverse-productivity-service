import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
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
import { FlashcardDeckModule } from './flashcard-decks/flashcard-deck.module';
import { FlashcardModule } from './flashcards/flashcard.module';
import { FocusSessionModule } from './focus-sessions/focus-session.module';
import { NoteFolderModule } from './note-folders/note-folder.module';
import { NoteModule } from './notes/note.module';
import { ReviewSessionModule } from './review_sessions/review-session.module';
import { TaskEventModule } from './task-events/task-event.module';
import { ShareModule } from './shares/share.module';
import { StreakModule } from './streaks/streak.module';
import { AuthMiddleware } from './midlleware/auth.middleware';
import { AchievementEvaluationMiddleware } from './midlleware/achievement-evaluation.middleware';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module';
import { AchievementModule } from './achievement/achievement.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { WorkspaceTaskModule } from './workspace-task/workspace-task.module';
import { UserInventoryModule } from './user-inventory/user-inventory.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { PurchaseHistoryModule } from './purchase-history/purchase-history.module';
import { MarketplaceFavoriteModule } from './marketplace-favorites/marketplace-favorite.module';
import { MarketplaceFollowerModule } from './marketplace-followers/marketplace-follower.module';
import { LiveRoomModule } from './focus-room/live-room.module';
import { WebhookModule } from './focus-room/webhook.module';
import { SpeechModule } from './speech/speech.module';
import { PaymentModule } from './payment/payment.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    AxiosClientModule,
    WebhookModule,
    // Import base modules first
    TagModule,
    TaskTagModule,
    // Import modules with circular dependencies in a specific order
    FriendModule,
    TasksModule,
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
    AxiosClientModule,
    ShareModule,
    StreakModule,
    CloudinaryModule,
    AchievementModule,
    WorkspaceModule,
    WorkspaceTaskModule,
    UserInventoryModule,

    PurchaseHistoryModule,
    MarketplaceModule,
    MarketplaceFavoriteModule,
    MarketplaceFollowerModule,
    LiveRoomModule,
    SpeechModule,
    PaymentModule,
    LeaderboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AchievementEvaluationMiddleware,
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
    consumer.apply(AchievementEvaluationMiddleware).forRoutes('*');
  }
}
