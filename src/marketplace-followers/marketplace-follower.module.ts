import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketplaceFollower, MarketplaceFollowerSchema } from './marketplace-follower.schema';
import { MarketplaceFollowerRepository } from './marketplace-follower.repository';
import { MarketplaceFollowerService } from './marketplace-follower.service';
import { MarketplaceFollowerController } from './marketplace-follower.controller';
import { AxiosClientModule } from '../http-axios/axios-client.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MarketplaceFollower.name, schema: MarketplaceFollowerSchema },
    ]),
    AxiosClientModule,
  ],
  controllers: [MarketplaceFollowerController],
  providers: [
    MarketplaceFollowerRepository,
    MarketplaceFollowerService,
  ],
  exports: [MarketplaceFollowerService, MarketplaceFollowerRepository],
})
export class MarketplaceFollowerModule {}
