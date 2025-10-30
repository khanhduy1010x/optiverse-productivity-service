import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MarketplaceItem, MarketplaceItemType } from './marketplace-item.schema';
import { Flashcard } from '../flashcards/flashcard.schema';
import { CreateFlashcardRequest } from '../flashcards/dto/request/CreateFlashcardRequest.dto';

@Injectable()
export class MarketplaceItemRepository {
  constructor(
    @InjectModel(MarketplaceItem.name)
    private marketplaceItemModel: Model<MarketplaceItem>,
    @InjectModel(Flashcard.name)
    private flashcardModel: Model<Flashcard>,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    type?: MarketplaceItemType,
  ): Promise<{ items: MarketplaceItem[]; total: number }> {
    try {
      const query: any = {};
      if (type) {
        query.type = type;
      }

      const skip = (page - 1) * limit;
      const [items, total] = await Promise.all([
        this.marketplaceItemModel
          .find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.marketplaceItemModel.countDocuments(query).exec(),
      ]);

      return { items, total };
    } catch (error) {
      console.error('Error in marketplace repository findAll:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<MarketplaceItem | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.marketplaceItemModel.findById(id).exec();
  }

  async create(data: Partial<MarketplaceItem>): Promise<MarketplaceItem> {
    const newItem = new this.marketplaceItemModel(data);
    return newItem.save();
  }

  async update(
    id: string,
    data: Partial<MarketplaceItem>,
  ): Promise<MarketplaceItem | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.marketplaceItemModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }
    const result = await this.marketplaceItemModel.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }

  async findByCreatorId(
    creatorId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ items: MarketplaceItem[]; total: number }> {
    if (!Types.ObjectId.isValid(creatorId)) {
      return { items: [], total: 0 };
    }

    const query = { creator_id: new Types.ObjectId(creatorId) };
    const skip = (page - 1) * limit;
    
    const [items, total] = await Promise.all([
      this.marketplaceItemModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.marketplaceItemModel.countDocuments(query).exec(),
    ]);

    return { items, total };
  }

  async getFlashcardById(id: string): Promise<Flashcard | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.flashcardModel.findById(id).exec();
  }

  async createFlashcard(userId: string, createFlashcardDto: CreateFlashcardRequest): Promise<Flashcard> {
    const newFlashcard = new this.flashcardModel({
      ...createFlashcardDto,
      deck_id: new Types.ObjectId(createFlashcardDto.deck_id),
    });
    return await newFlashcard.save();
  }
}