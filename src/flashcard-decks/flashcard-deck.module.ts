import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FlashcardDeck, FlashcardDeckSchema } from './flashcard-deck.schema';
import { FlashcardDeckController } from './flashcard-deck.controller';
import { FlashcardDeckService } from './flashcard-deck.service';
import { FlashcardDeckRepository } from './flashcard-deck.repository';
import { FlashcardRepository } from '../flashcards/flashcard.repository';
import { FlashcardModule } from '../flashcards/flashcard.module';
import { PdfProcessingService } from './services/pdf-processing.service';
import { GoogleGenAiService } from './services/google-genai.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FlashcardDeck.name, schema: FlashcardDeckSchema }]),
    FlashcardModule,
  ],
  controllers: [FlashcardDeckController],
  providers: [FlashcardDeckService, FlashcardDeckRepository, PdfProcessingService, GoogleGenAiService],
  exports: [FlashcardDeckService],
})
export class FlashcardDeckModule {}
