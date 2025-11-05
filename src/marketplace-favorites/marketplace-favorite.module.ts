import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketplaceFavorite, MarketplaceFavoriteSchema } from './marketplace-favorite.schema';
import { MarketplaceFavoriteRepository } from './marketplace-favorite.repository';
import { MarketplaceFavoriteService } from './marketplace-favorite.service';
import { MarketplaceFavoriteController } from './marketplace-favorite.controller';
import { MarketplaceItem, MarketplaceItemSchema } from '../marketplace/marketplace-item.schema';
import { MarketplaceItemRepository } from '../marketplace/marketplace-item.repository';
import { Flashcard, FlashcardSchema } from '../flashcards/flashcard.schema';
import { AxiosClientModule } from '../http-axios/axios-client.module';
import { PurchaseHistoryModule } from '../purchase-history/purchase-history.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MarketplaceFavorite.name, schema: MarketplaceFavoriteSchema },
      { name: MarketplaceItem.name, schema: MarketplaceItemSchema },
      { name: Flashcard.name, schema: FlashcardSchema },
    ]),
    AxiosClientModule,
    PurchaseHistoryModule,
  ],
  controllers: [MarketplaceFavoriteController],
  providers: [
    MarketplaceFavoriteRepository,
    MarketplaceFavoriteService,
    MarketplaceItemRepository,
  ],
  exports: [MarketplaceFavoriteService, MarketplaceFavoriteRepository],
})
export class MarketplaceFavoriteModule {}
