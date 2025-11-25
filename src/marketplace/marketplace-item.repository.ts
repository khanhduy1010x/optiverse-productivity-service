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
    
    // Build update object excluding undefined values
    // This prevents overwriting existing fields with undefined
    const updateData: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        updateData[key] = value;
      }
    }
    
    return this.marketplaceItemModel
      .findByIdAndUpdate(id, updateData, { new: true })
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

  /**
   * Count user's marketplace listings in current month
   * @param userId - User ID
   * @returns Count of listings created in current month
   */
  async countUserMonthlyListings(userId: string): Promise<number> {
    if (!Types.ObjectId.isValid(userId)) {
      return 0;
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    return this.marketplaceItemModel.countDocuments({
      creator_id: new Types.ObjectId(userId),
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    }).exec();
  }

  async findPaginated(
    page: number = 1,
    limit: number = 10,
    search?: string,
    price?: string,
    popularity?: string,
    sort?: string,
  ): Promise<{ items: MarketplaceItem[]; total: number }> {
    try {
      const query: any = {};

      // Search filter - tìm kiếm trong title và description
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      // Price filter - hỗ trợ: min-max, min, max, 0 (free)
      if (price) {
        if (price === '0') {
          // Free items only
          query.price = 0;
        } else {
          const priceRanges = price.split('-');
          if (priceRanges.length === 2) {
            const [min, max] = priceRanges;
            const minPrice = parseInt(min, 10);
            const maxPrice = parseInt(max, 10);
            if (!isNaN(minPrice) && !isNaN(maxPrice)) {
              query.price = { $gte: minPrice, $lte: maxPrice };
            }
          } else if (priceRanges.length === 1) {
            const singlePrice = parseInt(priceRanges[0], 10);
            if (!isNaN(singlePrice)) {
              query.price = { $gte: singlePrice };
            }
          }
        }
      }

      const skip = (page - 1) * limit;
      let query_builder = this.marketplaceItemModel
        .find(query)
        .skip(skip)
        .limit(limit);

      // Apply sorting
      let sortOption: any = { createdAt: -1 }; // Default: newest
      if (sort) {
        switch (sort) {
          case 'newest':
            sortOption = { createdAt: -1 };
            break;
          case 'oldest':
            sortOption = { createdAt: 1 };
            break;
          case 'price-high':
            sortOption = { price: -1 };
            break;
          case 'price-low':
            sortOption = { price: 1 };
            break;
          default:
            sortOption = { createdAt: -1 };
        }
      }
      query_builder = query_builder.sort(sortOption);

      // Popularity filter - lọc theo số lần mua
      if (popularity) {
        switch (popularity) {
          case 'top-100':
            // Top 100 most purchased items
            query_builder = query_builder.limit(100);
            break;
          case 'top-1000':
            // Items with >= 1000 purchases
            query.$expr = { $gte: ['$purchase_count', 1000] };
            break;
          case 'top-500':
            // Items with >= 500 purchases
            query.$expr = { $gte: ['$purchase_count', 500] };
            break;
          default:
            // 'all' - no popularity filter
            break;
        }
      }

      const [items, total] = await Promise.all([
        query_builder.exec(),
        this.marketplaceItemModel.countDocuments(query).exec(),
      ]);

      return { items, total };
    } catch (error) {
      console.error('Error in marketplace repository findPaginated:', error);
      throw error;
    }
  }
}