import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ReviewSession } from './review-session.schema';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { CreateReviewSessionRequest } from './dto/request/CreateReviewSessionRequest.dto';
import { UpdateReviewSessionRequest } from './dto/request/UpdateReviewSessionRequest.dto';

@Injectable()
export class ReviewSessionRepository {
  constructor(
    @InjectModel(ReviewSession.name) private readonly reviewSessionModel: Model<ReviewSession>,
  ) {}


  async createReviewSession(sessionData: Partial<ReviewSession>): Promise<ReviewSession> {
    const session = new this.reviewSessionModel(sessionData);
    return await session.save();
  }

  async deleteReviewSessionByFlashcardId(flashcardId: string): Promise<void> {
    await this.reviewSessionModel.findOneAndDelete({
      flashcard_id: new Types.ObjectId(flashcardId),
    });
  }
}
