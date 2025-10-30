import { Injectable } from '@nestjs/common';
import { MarketplaceItemRepository } from './marketplace-item.repository';
import { MarketplaceItem, MarketplaceItemType } from './marketplace-item.schema';
import { CreateMarketplaceItemDto } from './dto/request/create-marketplace-item.dto';
import { UpdateMarketplaceItemDto } from './dto/request/update-marketplace-item.dto';
import { PurchaseMarketplaceItemDto } from './dto/request/purchase-marketplace-item.dto';
import { MarketplaceItemResponseDto } from './dto/response/marketplace-item-response.dto';
import { PurchaseResponseDto } from './dto/response/purchase-response.dto';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { Types } from 'mongoose';
import { FlashcardDeckService } from '../flashcard-decks/flashcard-deck.service';
import { FlashcardService } from '../flashcards/flashcard.service';
import { UserInventoryService } from '../user-inventory/user-inventory.service';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { PurchaseHistoryService } from '../purchase-history/purchase-history.service';
import { UserHttpClient } from '../http-axios/user-http.client';

@Injectable()
export class MarketplaceItemService {
  constructor(
    private readonly repo: MarketplaceItemRepository,
    private readonly flashcardDeckService: FlashcardDeckService,
    private readonly flashcardService: FlashcardService,
    private readonly userInventoryService: UserInventoryService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly purchaseHistoryService: PurchaseHistoryService,
    private readonly userHttpClient: UserHttpClient,
  ) {}
  
  private async toResponseDto(item: MarketplaceItem): Promise<MarketplaceItemResponseDto> {
    let creatorInfo;
    try {
      // Lấy thông tin người tạo từ user service
      const users = await this.userHttpClient.getUsersByIds([item.creator_id.toString()]);
      if (users && users.length > 0) {
        creatorInfo = users[0];
      }
    } catch (error) {
      console.error('Failed to fetch creator info:', error);
      // Không throw error, tiếp tục với dữ liệu marketplace item
    }

    // Get purchase count
    let purchaseCount = 0;
    try {
      purchaseCount = await this.purchaseHistoryService.countPurchasesByMarketplaceItem(
        item._id.toString(),
      );
    } catch (error) {
      console.error('Failed to fetch purchase count:', error);
      // Không throw error, tiếp tục với giá trị mặc định
    }

    return {
      _id: item._id.toString(),
      creator_id: item.creator_id.toString(),
      creator_info: creatorInfo,
      title: item.title,
      description: item.description,
      images: item.images,
      price: item.price,
      type: item.type,
      type_id: item.type_id ? item.type_id.toString() : undefined,
      purchase_count: purchaseCount,
    };
  }

  /**
   * Upload images to Cloudinary
   */
  private async uploadImages(files: Express.Multer.File[]): Promise<string[]> {
    if (!files || files.length === 0) {
      return [];
    }

    const imageUrls: string[] = [];
    for (const file of files) {
      try {
        const imageUrl = await this.cloudinaryService.uploadFile(file, 'marketplace');
        imageUrls.push(imageUrl);
      } catch (error) {
        console.error('Failed to upload image:', error);
        throw new AppException(ErrorCode.INVALID_REQUEST);
      }
    }
    return imageUrls;
  }

  /**
   * Duplicate dữ liệu từ item gốc để tạo bản sao độc lập
   * Tránh việc thay đổi ở item gốc ảnh hưởng đến marketplace item
   */
  private async duplicateItemData(
    type: MarketplaceItemType,
    typeId: string,
  ): Promise<Record<string, any>> {
    switch (type) {
      case MarketplaceItemType.FLASHCARD:
        return this.duplicateFlashcardData(typeId);
      default:
        return {};
    }
  }

  /**
   * Duplicate flashcard data (front, back, etc.)
   * Luồng: Lấy ID flashcard deck → Tìm deck → Lấy flashcards từ deck
   */
  private async duplicateFlashcardData(
    flashcardDeckId: string,
  ): Promise<Record<string, any>> {
    // 1. Lấy flashcard deck từ ID
    const deckResponse = await this.flashcardDeckService.getFlashcardDeckById(flashcardDeckId);
    
    if (!deckResponse) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }

    const deck = deckResponse as any;

    // 2. Lấy danh sách flashcards - có thể từ response hoặc gọi service
    let flashcards = deck.flashcards || [];
    
    // Nếu response không có flashcards array, gọi service
    if (!flashcards || flashcards.length === 0) {
      flashcards = await this.flashcardService.getFlashcardsByDeckID(flashcardDeckId);
    }
    
    // Nếu deck trống, trả về bản sao trống
    if (!flashcards || flashcards.length === 0) {
      return {
        flashcards: [],
        originalFlashcardDeckId: deck._id.toString(),
        totalFlashcards: 0,
        duplicatedAt: new Date(),
      };
    }

    // 3. Lấy tất cả flashcards
    const duplicatedFlashcards = flashcards.map(flashcard => ({
      front: flashcard.front,
      back: flashcard.back,
      deck_id: flashcard.deck_id ? flashcard.deck_id.toString() : flashcardDeckId,
      originalFlashcardId: flashcard._id.toString(),
    }));

    // Tạo bản sao của tất cả flashcards
    return {
      flashcards: duplicatedFlashcards,
      originalFlashcardDeckId: deck._id.toString(),
      totalFlashcards: flashcards.length,
      duplicatedAt: new Date(),
    };
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    type?: MarketplaceItemType,
  ): Promise<{ items: MarketplaceItemResponseDto[]; total: number }> {
    try {
      const result = await this.repo.findAll(page, limit, type);
      const items = await Promise.all(result.items.map(item => this.toResponseDto(item)));
      return {
        items,
        total: result.total
      };
    } catch (error) {
      console.error('Error in findAll:', error);
      throw new AppException(ErrorCode.SERVER_ERROR);
    }
  }

  async findById(id: string): Promise<MarketplaceItemResponseDto> {
    try {
      const item = await this.repo.findById(id);
      if (!item) {
        throw new AppException(ErrorCode.NOT_FOUND);
      }
      return this.toResponseDto(item);
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      console.error('Error in findById:', error);
      throw new AppException(ErrorCode.SERVER_ERROR);
    }
  }

  async create(userId: string, dto: CreateMarketplaceItemDto, files?: Express.Multer.File[]): Promise<MarketplaceItemResponseDto> {
    // Upload images to Cloudinary
    const imageUrls = await this.uploadImages(files || []);

    // Kiểm tra type_id nếu có
    if (dto.type_id) {
      // Kiểm tra xem deck này có phải bản copy (có ref_id) không
      const deckResponse = await this.flashcardDeckService.getFlashcardDeckById(dto.type_id);
      if (deckResponse) {
        const deck = deckResponse as any;
        
        // Nếu deck có ref_id, kiểm tra marketplace item gốc còn tồn tại không
        if (deck.ref_id) {
          const originalMarketplaceItem = await this.repo.findById(deck.ref_id.toString());
          
          // Nếu marketplace item gốc vẫn còn tồn tại với giá > 0 → không được bán
          if (originalMarketplaceItem && originalMarketplaceItem.price > 0) {
            throw new AppException(ErrorCode.ALREADY_PURCHASED);
          }
        }
      }

      // Duplicate dữ liệu từ item gốc
      const copiedData = await this.duplicateItemData(dto.type, dto.type_id);
      
      const data = {
        ...dto,
        creator_id: new Types.ObjectId(userId),
        type_id: new Types.ObjectId(dto.type_id),
        ref_id: new Types.ObjectId(dto.type_id),
        copied_data: copiedData,
        images: imageUrls,
      };
      const item = await this.repo.create(data as any);
      return await this.toResponseDto(item);
    } else {
      // Nếu không có type_id, tạo item marketplace độc lập (có thể có giá > 0)
      const data = {
        ...dto,
        creator_id: new Types.ObjectId(userId),
        type_id: undefined,
        images: imageUrls,
      };
      const item = await this.repo.create(data as any);
      return await this.toResponseDto(item);
    }
  }

  async update(id: string, userId: string, dto: UpdateMarketplaceItemDto, files?: Express.Multer.File[]): Promise<MarketplaceItemResponseDto> {
    const item = await this.repo.findById(id);
    if (!item) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }

    // Kiểm tra quyền sở hữu
    if (item.creator_id.toString() !== userId) {
      throw new AppException(ErrorCode.PERMISSION_DENIED);
    }

    // Upload new images if provided
    let imageUrls = item.images;
    if (files && files.length > 0) {
      imageUrls = await this.uploadImages(files);
    }

    // Chuyển đổi type_id từ string sang ObjectId
    let updatedDto: any = {
      ...dto,
      type_id: dto.type_id ? new Types.ObjectId(dto.type_id) : undefined,
      images: imageUrls,
    };

    // Nếu type_id được update, cũng duplicate lại copied_data
    if (dto.type_id && dto.type) {
      const copiedData = await this.duplicateItemData(dto.type, dto.type_id);
      updatedDto.copied_data = copiedData;
      updatedDto.ref_id = new Types.ObjectId(dto.type_id);
    }

    const updatedItem = await this.repo.update(id, updatedDto);
    if (!updatedItem) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }
    
    return await this.toResponseDto(updatedItem);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const item = await this.repo.findById(id);
    if (!item) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }

    // Kiểm tra quyền sở hữu
    if (item.creator_id.toString() !== userId) {
      throw new AppException(ErrorCode.PERMISSION_DENIED);
    }

    return this.repo.delete(id);
  }

  async findByCreatorId(
    creatorId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ items: MarketplaceItemResponseDto[]; total: number }> {
    const result = await this.repo.findByCreatorId(creatorId, page, limit);
    const items = await Promise.all(result.items.map(item => this.toResponseDto(item)));
    return {
      items,
      total: result.total
    };
  }

  /**
   * Purchase marketplace item - Mua flashcard từ marketplace
   * 1. Kiểm tra đã mua rồi chưa
   * 2. Kiểm tra giá > 0
   * 3. Kiểm tra user có đủ tiền không
   * 4. Trừ tiền từ user
   * 5. Duplicate flashcard với ID mới cho người mua
   * 6. Add tiền cho người bán
   * 7. Lưu purchase history
   */
  async purchase(userId: string, dto: PurchaseMarketplaceItemDto): Promise<PurchaseResponseDto> {
    const marketplaceItem = await this.repo.findById(dto.marketplace_item_id);
    if (!marketplaceItem) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }

    const alreadyPurchased = await this.purchaseHistoryService.checkIfAlreadyPurchased(
      userId,
      dto.marketplace_item_id,
    );
    if (alreadyPurchased) {
      throw new AppException(ErrorCode.ALREADY_PURCHASED);
    }

  
    if (marketplaceItem.creator_id.toString() === userId) {
      throw new AppException(ErrorCode.PERMISSION_DENIED);
    }

    const buyerInventory = await this.userInventoryService.findByUserId(userId);
    const userPoints = this.getUserPoints(buyerInventory);
    
    if (userPoints < marketplaceItem.price) {
      throw new AppException(ErrorCode.INSUFFICIENT_BALANCE);
    }

    const deductedPoints = (userPoints - marketplaceItem.price).toString();
    await this.userInventoryService.addReward(userId, `-${marketplaceItem.price}`);

    const sellerPoints = marketplaceItem.price.toString();
    await this.userInventoryService.addReward(marketplaceItem.creator_id.toString(), sellerPoints);

    let purchasedFlashcardId: string;
    let purchasedDeckId: string;
    let createdFlashcards: string[] = [];

    if (marketplaceItem.type === MarketplaceItemType.FLASHCARD && marketplaceItem.copied_data) {
      const copiedData = marketplaceItem.copied_data;
      const originalDeckId = copiedData.originalFlashcardDeckId;

      const newDeck = await this.flashcardDeckService.createFlashcardDeck(
        {
          title: marketplaceItem.title + ` (Marketplace)`,
          description: marketplaceItem.description,
          ref_id: marketplaceItem._id,
        },
        userId,
      );

      purchasedDeckId = newDeck.flashcardDeck._id.toString();

      for (const flashcardData of copiedData.flashcards) {
        const newFlashcard = await this.repo.createFlashcard(userId, {
          deck_id: newDeck.flashcardDeck._id,
          front: flashcardData.front,
          back: flashcardData.back,
        });
        createdFlashcards.push(newFlashcard._id.toString());
      }

      purchasedFlashcardId = createdFlashcards[0];
    } else {
      throw new AppException(ErrorCode.INVALID_REQUEST);
    }

    await this.purchaseHistoryService.create({
      buyer_id: userId,
      seller_id: marketplaceItem.creator_id.toString(),
      marketplace_item_id: marketplaceItem._id.toString(),
      price: marketplaceItem.price,
    });

    return {
      message: 'Mua flashcard thành công',
      marketplace_item_id: marketplaceItem._id.toString(),
      purchased_flashcard_id: purchasedFlashcardId,
      purchased_deck_id: purchasedDeckId,
      details: {
        price: marketplaceItem.price,
        seller_id: marketplaceItem.creator_id.toString(),
        buyer_id: userId,
        remainingPoints: userPoints - marketplaceItem.price,
      }
    };
  }

  /**
   * Helper function - lấy điểm của user từ inventory
   */
  private getUserPoints(inventories: any[]): number {
    if (!inventories || inventories.length === 0) {
      return 0;
    }
    
    // Tìm record có op là số (là điểm)
    const pointsRecord = inventories.find(inv => /^\d+$/.test(inv.op));
    return pointsRecord ? parseInt(pointsRecord.op) : 0;
  }
}