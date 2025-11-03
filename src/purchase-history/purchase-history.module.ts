import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PurchaseHistory, PurchaseHistorySchema } from './purchase-history.schema';
import { PurchaseHistoryService } from './purchase-history.service';
import { PurchaseHistoryController } from './purchase-history.controller';
import { PurchaseHistoryRepository } from './purchase-history.repository';
import { UserHttpClient } from '../http-axios/user-http.client';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PurchaseHistory.name, schema: PurchaseHistorySchema },
    ]),
  ],
  providers: [PurchaseHistoryService, PurchaseHistoryRepository, UserHttpClient],
  controllers: [PurchaseHistoryController],
  exports: [PurchaseHistoryService],
})
export class PurchaseHistoryModule {}
