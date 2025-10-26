import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UserInventoryController } from './user-inventory.controller';
import { UserInventoryService } from './user-inventory.service';
import { UserInventoryRepository } from './user-inventory.repository';
import { UserInventory, UserInventorySchema, Frame, FrameSchema } from './user-inventory.schema';
import { CloudinaryModule } from '../common/cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigModule,
    CloudinaryModule,
    MongooseModule.forFeature([
      { name: UserInventory.name, schema: UserInventorySchema },
      { name: Frame.name, schema: FrameSchema }
    ])
  ],
  controllers: [UserInventoryController],
  providers: [UserInventoryService, UserInventoryRepository],
  exports: [UserInventoryService, UserInventoryRepository],
})
export class UserInventoryModule {}
