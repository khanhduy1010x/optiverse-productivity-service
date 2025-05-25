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

  async findByUserAndFlashcard(userId: string, flashcardId: string): Promise<ReviewSession | null> {
    return await this.reviewSessionModel
      .findOne({
        user_id: new Types.ObjectId(userId),
        flashcard_id: new Types.ObjectId(flashcardId),
      })
      .exec();
  }

  async updateByUserAndFlashcard(
    userId: string,
    flashcardId: string,
    data: Partial<ReviewSession>,
  ): Promise<ReviewSession> {
    return await this.reviewSessionModel
      .findOneAndUpdate(
        {
          user_id: new Types.ObjectId(userId),
          flashcard_id: new Types.ObjectId(flashcardId),
        },
        data,
        { new: true },
      )
      .orFail(new AppException(ErrorCode.NOT_FOUND))
      .exec();
  }
  async createReviewSession(sessionData: Partial<ReviewSession>): Promise<ReviewSession> {
    const session = new this.reviewSessionModel(sessionData);
    return await session.save();
  }

  async getReviewSessionsByUserID(userId: string): Promise<ReviewSession[]> {
    return await this.reviewSessionModel.find({ user_id: new Types.ObjectId(userId) }).exec();
  }

  async deleteReviewSessionByFlashcardId(flashcardId: string): Promise<void> {
    await this.reviewSessionModel.findOneAndDelete({
      flashcard_id: new Types.ObjectId(flashcardId),
    });
  }
}
