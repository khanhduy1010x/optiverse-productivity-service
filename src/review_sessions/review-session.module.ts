import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewSession, ReviewSessionSchema } from './review-session.schema';
import { ReviewSessionController } from './review-session.controller';
import { ReviewSessionService } from './review-session.service';
import { ReviewSessionRepository } from './review-session.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: ReviewSession.name, schema: ReviewSessionSchema }])],
  controllers: [ReviewSessionController],
  providers: [ReviewSessionService, ReviewSessionRepository],
  exports: [ReviewSessionService],
})
export class ReviewSessionModule {}
