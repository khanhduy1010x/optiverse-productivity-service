import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketplaceItem, MarketplaceItemSchema } from './marketplace-item.schema';
import { MarketplaceItemRepository } from './marketplace-item.repository';
import { MarketplaceItemService } from './marketplace-item.service';
import { MarketplaceItemController } from './marketplace-item.controller';
import { Flashcard, FlashcardSchema } from '../flashcards/flashcard.schema';
import { FlashcardModule } from '../flashcards/flashcard.module';
import { FlashcardDeckModule } from '../flashcard-decks/flashcard-deck.module';
import { UserInventoryModule } from '../user-inventory/user-inventory.module';
import { CloudinaryModule } from '../common/cloudinary/cloudinary.module';
import { PurchaseHistoryModule } from '../purchase-history/purchase-history.module';
import { AxiosClientModule } from '../http-axios/axios-client.module';
import { RatingModule } from './rating/rating.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MarketplaceItem.name, schema: MarketplaceItemSchema },
      { name: Flashcard.name, schema: FlashcardSchema },
    ]),
    FlashcardModule,
    FlashcardDeckModule,
    UserInventoryModule,
    CloudinaryModule,
    PurchaseHistoryModule,
    AxiosClientModule,
    RatingModule,
  ],
  controllers: [MarketplaceItemController],
  providers: [MarketplaceItemRepository, MarketplaceItemService],
  exports: [MarketplaceItemService],
})
export class MarketplaceModule {}