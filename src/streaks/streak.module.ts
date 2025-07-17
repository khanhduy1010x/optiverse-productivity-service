import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Streak, StreakSchema } from './streak.schema';
import { StreakController } from './streak.controller';
import { StreakService } from './streak.service';
import { StreakRepository } from './streak.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: Streak.name, schema: StreakSchema }])],
  controllers: [StreakController],
  providers: [StreakService, StreakRepository],
  exports: [StreakService],
})
export class StreakModule {} 