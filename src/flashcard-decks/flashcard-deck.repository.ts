import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FlashcardDeck } from './flashcard-deck.schema';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { CreateFlashcardDeckRequest } from './dto/request/CreateFlashcardDeckRequest.dto';
import { UpdateFlashcardDeckRequest } from './dto/request/UpdateFlashcardDeckRequest.dto';
import { FlashcardDeckResponse } from './dto/response/FlashcardDeckResponse.dto';

@Injectable()
export class FlashcardDeckRepository {
  constructor(
    @InjectModel(FlashcardDeck.name) private readonly flashcardDeckModel: Model<FlashcardDeck>,
  ) {}

  async getFlashcardDecksByUserID(userId: string): Promise<FlashcardDeckResponse[]> {
    const now = Date.now();
    const pipeline = this.buildFlashcardDeckPipeline({ user_id: new Types.ObjectId(userId) }, now);

    // Add sorting
    pipeline.push({ $sort: { updatedAt: -1 } });

    // Ignore flashcards array
    pipeline.push({
      $project: {
        flashcards: 0,
      },
    });

    return this.flashcardDeckModel.aggregate(pipeline);
  }

  async getFlashcardDeckById(deckId: string): Promise<FlashcardDeckResponse | null> {
    const now = Date.now();
    const pipeline = this.buildFlashcardDeckPipeline({ _id: new Types.ObjectId(deckId) }, now);

    const results = await this.flashcardDeckModel.aggregate(pipeline);
    return results[0] || null;
  }

  buildFlashcardDeckPipeline(matchCondition: object, now: number): any[] {
    return [
      // 1. Filter decks by match condition
      { $match: matchCondition },

      // 2. Lookup all flashcards for each deck
      {
        $lookup: {
          from: 'flashcards',
          localField: '_id',
          foreignField: 'deck_id',
          as: 'flashcards',
        },
      },

      // 3. Lookup review sessions linked to those flashcards
      {
        $lookup: {
          from: 'reviewsessions',
          let: { flashcardIds: '$flashcards._id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$flashcard_id', '$$flashcardIds'],
                },
              },
            },
          ],
          as: 'reviews',
        },
      },

      // 4. Map each flashcard to its corresponding review (if any)
      {
        $addFields: {
          flashcards: {
            $map: {
              input: '$flashcards',
              as: 'fc',
              in: {
                _id: '$$fc._id',
                front: '$$fc.front',
                back: '$$fc.back',
                review: {
                  $first: {
                    $filter: {
                      input: '$reviews',
                      as: 'rv',
                      cond: {
                        $eq: ['$$rv.flashcard_id', '$$fc._id'],
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },

      // 5. Count flashcards by status and find the latest review time
      {
        $addFields: {
          newCount: {
            $size: {
              $filter: {
                input: '$flashcards',
                as: 'fc',
                cond: {
                  $or: [
                    { $eq: ['$$fc.review', null] },
                    { $eq: ['$$fc.review.repetition_count', 0] },
                  ],
                },
              },
            },
          },
          learningCount: {
            $size: {
              $filter: {
                input: '$flashcards',
                as: 'fc',
                cond: {
                  $and: [
                    { $ne: ['$$fc.review', null] },
                    { $gte: ['$$fc.review.repetition_count', 1] },
                    { $lt: ['$$fc.review.interval', 6] },
                  ],
                },
              },
            },
          },
          reviewingCount: {
            $size: {
              $filter: {
                input: '$flashcards',
                as: 'fc',
                cond: {
                  $and: [
                    { $ne: ['$$fc.review', null] },
                    { $gte: ['$$fc.review.repetition_count', 1] },
                    { $gte: ['$$fc.review.interval', 6] },
                  ],
                },
              },
            },
          },
          lastReviewRaw: { $max: '$reviews.last_review' },
        },
      },

      // 6. Convert lastReview to timestamp (in seconds); fallback to createdAt if no reviews
      {
        $addFields: {
          lastReview: {
            $cond: [
              { $ifNull: ['$lastReviewRaw', false] },
              {
                $divide: [
                  {
                    $subtract: [{ $toLong: { $literal: now } }, { $toLong: '$lastReviewRaw' }],
                  },
                  1000,
                ],
              },
              {
                $divide: [
                  {
                    $subtract: [{ $toLong: { $literal: now } }, { $toLong: '$createdAt' }],
                  },
                  1000,
                ],
              },
            ],
          },
        },
      },

      // 7. Clean up intermediate fields before returning
      {
        $project: {
          reviews: 0,
          lastReviewRaw: 0,
        },
      },
    ];
  }

  async createFlashcardDeck(
    createFlashcardDeckDto: CreateFlashcardDeckRequest,
    userId: string,
  ): Promise<FlashcardDeck> {
    const newFlashcardDeck = new this.flashcardDeckModel({
      ...createFlashcardDeckDto,
      user_id: new Types.ObjectId(userId),
    });
    return await newFlashcardDeck.save();
  }

  async updateFlashcardDeck(
    flashcardDeckId: string,
    updateFlashcardDeckDto: UpdateFlashcardDeckRequest,
  ): Promise<FlashcardDeck> {
    return await this.flashcardDeckModel
      .findByIdAndUpdate(flashcardDeckId, updateFlashcardDeckDto, { new: true })
      .orFail(new AppException(ErrorCode.NOT_FOUND));
  }

  async deleteFlashcardDeck(flashcardDeckId: string): Promise<void> {
    const result = await this.flashcardDeckModel.deleteOne({ _id: flashcardDeckId }).exec();
    if (result.deletedCount === 0) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }
  }
}
