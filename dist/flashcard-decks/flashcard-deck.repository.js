"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlashcardDeckRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const flashcard_deck_schema_1 = require("./flashcard-deck.schema");
const app_exception_1 = require("../common/exceptions/app.exception");
const error_code_enum_1 = require("../common/exceptions/error-code.enum");
let FlashcardDeckRepository = class FlashcardDeckRepository {
    constructor(flashcardDeckModel) {
        this.flashcardDeckModel = flashcardDeckModel;
    }
    async getFlashcardDecksByUserID(userId) {
        const now = Date.now();
        const pipeline = this.buildFlashcardDeckPipeline({ user_id: new mongoose_2.Types.ObjectId(userId) }, now);
        pipeline.push({ $sort: { updatedAt: -1 } });
        pipeline.push({
            $project: {
                flashcards: 0,
            },
        });
        return this.flashcardDeckModel.aggregate(pipeline);
    }
    async getFlashcardDeckById(deckId) {
        const now = Date.now();
        const pipeline = this.buildFlashcardDeckPipeline({ _id: new mongoose_2.Types.ObjectId(deckId) }, now);
        const results = await this.flashcardDeckModel.aggregate(pipeline);
        return results[0] || null;
    }
    buildFlashcardDeckPipeline(matchCondition, now) {
        return [
            { $match: matchCondition },
            {
                $lookup: {
                    from: 'flashcards',
                    localField: '_id',
                    foreignField: 'deck_id',
                    as: 'flashcards',
                },
            },
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
            {
                $project: {
                    reviews: 0,
                    lastReviewRaw: 0,
                },
            },
        ];
    }
    async createFlashcardDeck(createFlashcardDeckDto, userId) {
        const newFlashcardDeck = new this.flashcardDeckModel({
            ...createFlashcardDeckDto,
            user_id: new mongoose_2.Types.ObjectId(userId),
        });
        return await newFlashcardDeck.save();
    }
    async updateFlashcardDeck(flashcardDeckId, updateFlashcardDeckDto) {
        return await this.flashcardDeckModel
            .findByIdAndUpdate(flashcardDeckId, updateFlashcardDeckDto, { new: true })
            .orFail(new app_exception_1.AppException(error_code_enum_1.ErrorCode.NOT_FOUND));
    }
    async deleteFlashcardDeck(flashcardDeckId) {
        const result = await this.flashcardDeckModel.deleteOne({ _id: flashcardDeckId }).exec();
        if (result.deletedCount === 0) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.NOT_FOUND);
        }
    }
    async getStatisticsByUserID(userId) {
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const result = await this.flashcardDeckModel.aggregate([
            { $match: { user_id: new mongoose_2.Types.ObjectId(userId) } },
            { $lookup: {
                    from: 'flashcards',
                    localField: '_id',
                    foreignField: 'deck_id',
                    as: 'flashcards',
                } },
            { $lookup: {
                    from: 'reviewsessions',
                    let: { flashcardIds: '$flashcards._id' },
                    pipeline: [
                        { $match: {
                                $expr: { $in: ['$flashcard_id', '$$flashcardIds'] },
                            } },
                    ],
                    as: 'reviews',
                } },
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
                } },
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
                } },
        ]);
        return result[0] || null;
    }
    async getReviewsByDay(userId) {
        const result = await this.flashcardDeckModel.aggregate([
            { $match: { user_id: new mongoose_2.Types.ObjectId(userId) } },
            { $lookup: {
                    from: 'flashcards',
                    localField: '_id',
                    foreignField: 'deck_id',
                    as: 'flashcards',
                } },
            { $lookup: {
                    from: 'reviewsessions',
                    let: { flashcardIds: '$flashcards._id' },
                    pipeline: [
                        { $match: {
                                $expr: { $in: ['$flashcard_id', '$$flashcardIds'] },
                            } },
                    ],
                    as: 'reviews',
                } },
            { $unwind: '$reviews' },
            { $match: {
                    'reviews.user_id': new mongoose_2.Types.ObjectId(userId),
                    'reviews.repetition_count': { $gte: 1 },
                } },
            { $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: '$reviews.last_review' }
                    },
                    count: { $sum: 1 },
                } },
            { $sort: { '_id': 1 } },
            { $project: {
                    _id: 0,
                    date: '$_id',
                    count: 1,
                } },
        ]);
        return result;
    }
    async getDueTodayPerDeck(userId) {
        const result = await this.flashcardDeckModel.aggregate([
            { $match: { user_id: new mongoose_2.Types.ObjectId(userId) } },
            { $lookup: {
                    from: 'flashcards',
                    localField: '_id',
                    foreignField: 'deck_id',
                    as: 'flashcards',
                } },
            { $lookup: {
                    from: 'reviewsessions',
                    let: { flashcardIds: '$flashcards._id' },
                    pipeline: [
                        { $match: {
                                $expr: { $in: ['$flashcard_id', '$$flashcardIds'] },
                            } },
                    ],
                    as: 'reviews',
                } },
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
                } },
            { $match: { dueTodayCount: { $gt: 0 } } },
            { $sort: { dueTodayCount: -1 } },
            { $project: {
                    _id: 0,
                    deckTitle: '$title',
                    dueTodayCount: 1,
                } },
        ]);
        return result;
    }
};
exports.FlashcardDeckRepository = FlashcardDeckRepository;
exports.FlashcardDeckRepository = FlashcardDeckRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(flashcard_deck_schema_1.FlashcardDeck.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], FlashcardDeckRepository);
//# sourceMappingURL=flashcard-deck.repository.js.map