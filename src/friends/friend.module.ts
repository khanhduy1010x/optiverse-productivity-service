import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Friend, FriendSchema } from './friend.schema';
import { FriendController } from './friend.controller';
import { FriendService } from './friend.service';
import { FriendRepository } from './friend.repository';
import { AxiosClientModule } from 'src/http-axios/axios-client.module';
import { UserHttpClient } from 'src/http-axios/user-http.client';
import { AchievementModule } from 'src/achievements/achievement.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Friend.name, schema: FriendSchema }]),
    AxiosClientModule,
    forwardRef(() => AchievementModule),
  ],
  controllers: [FriendController],
  providers: [FriendService, FriendRepository, UserHttpClient],
  exports: [FriendService, FriendRepository],
})
export class FriendModule {}
