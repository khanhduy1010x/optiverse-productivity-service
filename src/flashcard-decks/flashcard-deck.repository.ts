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
    // Only get personal decks (no workspace_id)
    const pipeline = this.buildFlashcardDeckPipeline({ 
      user_id: new Types.ObjectId(userId),
      workspace_id: { $exists: false }  // Exclude workspace decks
    }, now);

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

      // 2. Lookup user who created the deck
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'creator',
        },
      },
      {
        $unwind: {
          path: '$creator',
          preserveNullAndEmptyArrays: true,
        },
      },

      // 3. Lookup all flashcards for each deck
      {
        $lookup: {
          from: 'flashcards',
          localField: '_id',
          foreignField: 'deck_id',
          as: 'flashcards',
        },
      },

      // 4. Lookup review sessions linked to those flashcards
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

      // 5. Map each flashcard to its corresponding review (if any)
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
    const deckData: any = {
      ...createFlashcardDeckDto,
      user_id: new Types.ObjectId(userId),
    };
    
    // Convert workspace_id to ObjectId if provided
    if (createFlashcardDeckDto.workspace_id) {
      deckData.workspace_id = new Types.ObjectId(createFlashcardDeckDto.workspace_id);
    }
    
    const newFlashcardDeck = new this.flashcardDeckModel(deckData);
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

  async getFlashcardDecksByWorkspaceID(workspaceId: string): Promise<FlashcardDeckResponse[]> {
    const now = Date.now();
    const pipeline = this.buildFlashcardDeckPipeline({ workspace_id: new Types.ObjectId(workspaceId) }, now);

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

  async getStatisticsByUserID(userId: string): Promise<any> {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const result = await this.flashcardDeckModel.aggregate([
      { $match: { 
        user_id: new Types.ObjectId(userId),
        workspace_id: { $exists: false }  // Only personal decks
      } },

      { $lookup: {
        from: 'flashcards',
        localField: '_id',
        foreignField: 'deck_id',
        as: 'flashcards',
      }},

      { $lookup: {
        from: 'reviewsessions',
        let: { flashcardIds: '$flashcards._id' },
        pipeline: [
          { $match: {
            $expr: { $in: ['$flashcard_id', '$$flashcardIds'] },
          }},
        ],
        as: 'reviews',
      }},

      { $group: {
        _id: null,
        totalDeckCount: { $sum: 1 },
        totalFlashcardCount: { $sum: { $size: '$flashcards' } },

        dueTodayCount: {
          $sum: {
            $size: {
              $filter: {
                input: '$reviews',
                as: 'rv',
                cond: { $lte: ['$$rv.next_review', new Date()] },
              },
            },
          },
        },

        reviewsThisWeekCount: {
          $sum: {
            $size: {
              $filter: {
                input: '$reviews',
                as: 'rv',
                cond: {
                  $and: [
                    { $gte: ['$$rv.last_review', startOfWeek] },
                    { $gte: ['$$rv.repetition_count', 1] }, // chỉ thẻ đã review ít nhất 1 lần
                  ],
                },
              },
            },
          },
        },

        reviewedCount: {
          $sum: {
            $size: {
              $filter: {
                input: '$reviews',
                as: 'rv',
                cond: { $gte: ['$$rv.repetition_count', 1] },
              },
            },
          },
        },

        newCount: {
          $sum: {
            $size: {
              $filter: {
                input: '$reviews',
                as: 'rv',
                cond: { $eq: ['$$rv.repetition_count', 0] },
              },
            },
          },
        },

        learningCount: {
          $sum: {
            $size: {
              $filter: {
                input: '$reviews',
                as: 'rv',
                cond: {
                  $and: [
                    { $gte: ['$$rv.repetition_count', 1] },
                    { $lt: ['$$rv.interval', 6] },
                  ],
                },
              },
            },
          },
        },

        reviewingCount: {
          $sum: {
            $size: {
              $filter: {
                input: '$reviews',
                as: 'rv',
                cond: { $gte: ['$$rv.interval', 6] },
              },
            },
          },
        },
      }},

      // Add % reviewed
      { $addFields: {
        percentReviewed: {
          $cond: [
            { $gt: ['$totalFlashcardCount', 0] },
            {
              $multiply: [
                { $divide: ['$reviewedCount', '$totalFlashcardCount'] },
                100,
              ],
            },
            0,
          ],
        },
      }},
    ]);

    return result[0] || null;
  }




  async getReviewsByDay(userId: string): Promise<any[]> {
    const result = await this.flashcardDeckModel.aggregate([
      { $match: { 
        user_id: new Types.ObjectId(userId),
        workspace_id: { $exists: false }  // Only personal decks
      } },

      { $lookup: {
        from: 'flashcards',
        localField: '_id',
        foreignField: 'deck_id',
        as: 'flashcards',
      }},

      { $lookup: {
        from: 'reviewsessions',
        let: { flashcardIds: '$flashcards._id' },
        pipeline: [
          { $match: {
            $expr: { $in: ['$flashcard_id', '$$flashcardIds'] },
          }},
        ],
        as: 'reviews',
      }},

      // Tách mỗi review thành 1 row
      { $unwind: '$reviews' },

      // Chỉ lấy review của user này
      { $match: { 
          'reviews.user_id': new Types.ObjectId(userId),
          'reviews.repetition_count': { $gte: 1 },
      }},


      // Group by ngày
      { $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: '$reviews.last_review' }
        },
        count: { $sum: 1 },
      }},

      // Sort ngày tăng dần
      { $sort: { '_id': 1 } },

      // Đổi field cho đẹp
      { $project: {
        _id: 0,
        date: '$_id',
        count: 1,
      }},
    ]);

    return result;
  }

  async getDueTodayPerDeck(userId: string): Promise<any[]> {
    const result = await this.flashcardDeckModel.aggregate([
      { $match: { 
        user_id: new Types.ObjectId(userId),
        workspace_id: { $exists: false }  // Only personal decks
      } },

      { $lookup: {
        from: 'flashcards',
        localField: '_id',
        foreignField: 'deck_id',
        as: 'flashcards',
      }},

      { $lookup: {
        from: 'reviewsessions',
        let: { flashcardIds: '$flashcards._id' },
        pipeline: [
          { $match: {
            $expr: { $in: ['$flashcard_id', '$$flashcardIds'] },
          }},
        ],
        as: 'reviews',
      }},

      // Tính dueTodayCount per deck
      { $project: {
        title: 1,
        dueTodayCount: {
          $size: {
            $filter: {
              input: '$reviews',
              as: 'rv',
              cond: { $lte: ['$$rv.next_review', new Date()] },
            },
          },
        },
      }},

      // Chỉ lấy deck có > 0 dueTodayCount (nếu bạn muốn)
      { $match: { dueTodayCount: { $gt: 0 } } },

      // Sort deck có nhiều dueToday nhất lên đầu
      { $sort: { dueTodayCount: -1 } },

      // Format output
      { $project: {
        _id: 0,
        deckTitle: '$title',
        dueTodayCount: 1,
      }},
    ]);

    return result;
  }

  async getStatisticsByWorkspaceID(workspaceId: string, userId: string): Promise<any> {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const result = await this.flashcardDeckModel.aggregate([
      { $match: { workspace_id: new Types.ObjectId(workspaceId) } },

      { $lookup: {
        from: 'flashcards',
        localField: '_id',
        foreignField: 'deck_id',
        as: 'flashcards',
      }},

      { $lookup: {
        from: 'reviewsessions',
        let: { flashcardIds: '$flashcards._id' },
        pipeline: [
          { $match: {
            $expr: {
              $and: [
                { $in: ['$flashcard_id', '$$flashcardIds'] },
                { $eq: ['$user_id', new Types.ObjectId(userId)] },
              ],
            },
          }},
        ],
        as: 'reviews',
      }},

      { $group: {
        _id: null,
        totalDeckCount: { $sum: 1 },
        totalFlashcardCount: { $sum: { $size: '$flashcards' } },

        dueTodayCount: {
          $sum: {
            $size: {
              $filter: {
                input: '$reviews',
                as: 'rv',
                cond: { $lte: ['$$rv.next_review', new Date()] },
              },
            },
          },
        },

        reviewsThisWeekCount: {
          $sum: {
            $size: {
              $filter: {
                input: '$reviews',
                as: 'rv',
                cond: {
                  $and: [
                    { $gte: ['$$rv.last_review', startOfWeek] },
                    { $gte: ['$$rv.repetition_count', 1] },
                  ],
                },
              },
            },
          },
        },

        reviewedCount: {
          $sum: {
            $size: {
              $filter: {
                input: '$reviews',
                as: 'rv',
                cond: { $gte: ['$$rv.repetition_count', 1] },
              },
            },
          },
        },

        newCount: {
          $sum: {
            $size: {
              $filter: {
                input: '$reviews',
                as: 'rv',
                cond: { $eq: ['$$rv.repetition_count', 0] },
              },
            },
          },
        },

        learningCount: {
          $sum: {
            $size: {
              $filter: {
                input: '$reviews',
                as: 'rv',
                cond: {
                  $and: [
                    { $gte: ['$$rv.repetition_count', 1] },
                    { $lt: ['$$rv.interval', 6] },
                  ],
                },
              },
            },
          },
        },

        reviewingCount: {
          $sum: {
            $size: {
              $filter: {
                input: '$reviews',
                as: 'rv',
                cond: { $gte: ['$$rv.interval', 6] },
              },
            },
          },
        },
      }},

      { $addFields: {
        percentReviewed: {
          $cond: [
            { $gt: ['$totalFlashcardCount', 0] },
            {
              $multiply: [
                { $divide: ['$reviewedCount', '$totalFlashcardCount'] },
                100,
              ],
            },
            0,
          ],
        },
      }},
    ]);

    return result[0] || null;
  }

  async getReviewsByDayByWorkspace(workspaceId: string, userId: string): Promise<any[]> {
    const result = await this.flashcardDeckModel.aggregate([
      { $match: { workspace_id: new Types.ObjectId(workspaceId) } },

      { $lookup: {
        from: 'flashcards',
        localField: '_id',
        foreignField: 'deck_id',
        as: 'flashcards',
      }},

      { $lookup: {
        from: 'reviewsessions',
        let: { flashcardIds: '$flashcards._id' },
        pipeline: [
          { $match: {
            $expr: {
              $and: [
                { $in: ['$flashcard_id', '$$flashcardIds'] },
                { $eq: ['$user_id', new Types.ObjectId(userId)] },
              ],
            },
          }},
        ],
        as: 'reviews',
      }},

      { $unwind: '$reviews' },

      { $match: { 
          'reviews.user_id': new Types.ObjectId(userId),
          'reviews.repetition_count': { $gte: 1 },
      }},

      { $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: '$reviews.last_review' }
        },
        count: { $sum: 1 },
      }},

      { $sort: { '_id': 1 } },

      { $project: {
        _id: 0,
        date: '$_id',
        count: 1,
      }},
    ]);

    return result;
  }

  async getDueTodayPerDeckByWorkspace(workspaceId: string, userId: string): Promise<any[]> {
    const result = await this.flashcardDeckModel.aggregate([
      { $match: { workspace_id: new Types.ObjectId(workspaceId) } },

      { $lookup: {
        from: 'flashcards',
        localField: '_id',
        foreignField: 'deck_id',
        as: 'flashcards',
      }},

      { $lookup: {
        from: 'reviewsessions',
        let: { flashcardIds: '$flashcards._id' },
        pipeline: [
          { $match: {
            $expr: {
              $and: [
                { $in: ['$flashcard_id', '$$flashcardIds'] },
                { $eq: ['$user_id', new Types.ObjectId(userId)] },
              ],
            },
          }},
        ],
        as: 'reviews',
      }},

      { $project: {
        title: 1,
        dueTodayCount: {
          $size: {
            $filter: {
              input: '$reviews',
              as: 'rv',
              cond: { $lte: ['$$rv.next_review', new Date()] },
            },
          },
        },
      }},

      { $match: { dueTodayCount: { $gt: 0 } } },

      { $sort: { dueTodayCount: -1 } },

      { $project: {
        _id: 0,
        deckTitle: '$title',
        dueTodayCount: 1,
      }},
    ]);

    return result;
  }
}

