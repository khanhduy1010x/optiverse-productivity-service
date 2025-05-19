import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Flashcard, FlashcardSchema } from './flashcard.schema';
import { FlashcardController } from './flashcard.controller';
import { FlashcardService } from './flashcard.service';
import { FlashcardRepository } from './flashcard.repository';
import { ReviewSessionModule } from '../review_sessions/review-session.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Flashcard.name, schema: FlashcardSchema }]),
    ReviewSessionModule,
  ],
  controllers: [FlashcardController],
  providers: [FlashcardService, FlashcardRepository],
  exports: [FlashcardService],
})
export class FlashcardModule {}
