import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Rating, RatingSchema } from './rating.schema';
import { RatingRepository } from './rating.repository';
import { RatingService } from './rating.service';
import { RatingController } from './rating.controller';
import { AxiosClientModule } from 'src/http-axios/axios-client.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Rating.name, schema: RatingSchema }]),
    AxiosClientModule,
  ],
  controllers: [RatingController],
  providers: [RatingRepository, RatingService],
  exports: [RatingService],
})
export class RatingModule {}
