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
import { MembershipBenefits, MembershipHttpClient } from '../http-axios/membership-http.client';

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
    private readonly membershipHttpClient: MembershipHttpClient,
  ) {}
  
  private async toResponseDto(item: MarketplaceItem, userId?: string): Promise<MarketplaceItemResponseDto> {
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

    // Check if user already purchased this item
    let isPurchased = false;
    if (userId) {
      try {
        isPurchased = await this.purchaseHistoryService.checkIfAlreadyPurchased(
          userId,
          item._id.toString(),
        );
      } catch (error) {
        console.error('Failed to check purchase status:', error);
        // Không throw error, tiếp tục với giá trị mặc định
      }
    }

    // Calculate pricing with membership discount if userId provided
    let pricing: any = undefined;
    if (userId) {
      try {
        const userLevel = await this.membershipHttpClient.getUserMembershipLevel(userId);
        const benefits = this.getMembershipBenefits(userLevel);
        const discount = benefits.marketplace_discount || 0;
        const discountAmount = Math.floor(item.price * discount);
        const finalPrice = item.price - discountAmount;

        // Map membership level to tier name
        const membershipTierMap = {
          '-1': 'FREE',
          '0': 'BASIC',
          '1': 'PLUS',
          '2': 'PREMIUM',
        };
        const membershipTier = membershipTierMap[userLevel.toString()] || 'UNKNOWN';

        pricing = {
          original_price: item.price,
          discount_percentage: Math.round(discount * 100),
          discount_amount: discountAmount,
          final_price: finalPrice,
          membership_tier: membershipTier,
        };
      } catch (error) {
        console.error('Failed to fetch pricing info:', error);
        // Không throw error, tiếp tục mà không có pricing
      }
    }

    return {
      _id: item._id.toString(),
      creator_id: item.creator_id.toString(),
      creator_info: creatorInfo,
      title: item.title,
      description: item.description,
      images: item.images,
      price: item.price,
      pricing: pricing,
      type: item.type,
      type_id: item.type_id ? item.type_id.toString() : undefined,
      purchase_count: purchaseCount,
      is_purchased: isPurchased,
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

  /**
   * Get preview flashcards - Lấy 20% flashcard để preview
   */
  async getPreviewFlashcards(
    marketplaceItemId: string,
  ): Promise<{ flashcards: any[]; totalFlashcards: number; previewCount: number }> {
    try {
      const item = await this.repo.findById(marketplaceItemId);
      if (!item) {
        throw new AppException(ErrorCode.NOT_FOUND);
      }

      // Kiểm tra nếu là flashcard item
      if (item.type !== MarketplaceItemType.FLASHCARD || !item.copied_data) {
        return {
          flashcards: [],
          totalFlashcards: 0,
          previewCount: 0,
        };
      }

      const allFlashcards = item.copied_data.flashcards || [];
      const totalFlashcards = allFlashcards.length;
      
      // Lấy 20% flashcard, tối thiểu 1 cái
      const previewCount = Math.max(1, Math.ceil(totalFlashcards * 0.2));
      const previewFlashcards = allFlashcards.slice(0, previewCount);

      return {
        flashcards: previewFlashcards,
        totalFlashcards,
        previewCount,
      };
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      console.error('Error in getPreviewFlashcards:', error);
      throw new AppException(ErrorCode.SERVER_ERROR);
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    type?: MarketplaceItemType,
    userId?: string,
  ): Promise<{ items: MarketplaceItemResponseDto[]; total: number }> {
    try {
      const result = await this.repo.findAll(page, limit, type);
      
      // Sort items with priority listing first
      const itemsWithCreators = await Promise.all(
        result.items.map(async (item) => {
          const responseDto = await this.toResponseDto(item, userId);
          
          // Get seller's membership level for priority listing
          let sellerLevel = -1;
          try {
            sellerLevel = await this.membershipHttpClient.getUserMembershipLevel(item.creator_id.toString());
          } catch (error) {
            console.error('Failed to fetch seller membership level:', error);
          }

          return {
            ...responseDto,
            seller_priority_listing: sellerLevel === 2, // Level 2 = PREMIUM
          };
        }),
      );

      // Sort: Premium sellers (priority_listing=true) first, then others
      const sortedItems = itemsWithCreators.sort((a, b) => {
        if (a.seller_priority_listing && !b.seller_priority_listing) return -1;
        if (!a.seller_priority_listing && b.seller_priority_listing) return 1;
        return 0;
      });

      return {
        items: sortedItems as any,
        total: result.total
      };
    } catch (error) {
      console.error('Error in findAll:', error);
      throw new AppException(ErrorCode.SERVER_ERROR);
    }
  }

  async findById(id: string, userId?: string): Promise<MarketplaceItemResponseDto> {
    try {
      const item = await this.repo.findById(id);
      if (!item) {
        throw new AppException(ErrorCode.NOT_FOUND);
      }
      return this.toResponseDto(item, userId);
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      console.error('Error in findById:', error);
      throw new AppException(ErrorCode.SERVER_ERROR);
    }
  }

  async create(userId: string, dto: CreateMarketplaceItemDto, files?: Express.Multer.File[]): Promise<MarketplaceItemResponseDto> {
    // Get user membership level
    const userLevel = await this.membershipHttpClient.getUserMembershipLevel(userId);
    const benefits = this.getMembershipBenefits(userLevel);

    // Check if user can sell based on membership level
    if (benefits.marketplace_sell_limit === 0) {
      throw new AppException(ErrorCode.PERMISSION_DENIED);
    }

    // If there's a limit, check current sell count this month
    if (benefits.marketplace_sell_limit > 0) {
      const currentMonthSellCount = await this.repo.countUserMonthlyListings(userId);
      if (currentMonthSellCount >= benefits.marketplace_sell_limit) {
        throw new AppException(ErrorCode.PERMISSION_DENIED);
      }
    }

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
    userId?: string,
  ): Promise<{ items: MarketplaceItemResponseDto[]; total: number }> {
    const result = await this.repo.findByCreatorId(creatorId, page, limit);
    const items = await Promise.all(result.items.map(item => this.toResponseDto(item, userId)));
    return {
      items,
      total: result.total
    };
  }

  /**
   * Purchase marketplace item - Mua flashcard từ marketplace
   * 1. Kiểm tra membership benefits
   * 2. Kiểm tra đã mua rồi chưa
   * 3. Kiểm tra giá > 0
   * 4. Kiểm tra user có đủ tiền không (sau khi áp dụng discount)
   * 5. Trừ tiền từ user (có áp dụng discount)
   * 6. Duplicate flashcard với ID mới cho người mua
   * 7. Add tiền cho người bán (mặc dù có discount)
   * 8. Lưu purchase history
   */
  async purchase(userId: string, level: number, dto: PurchaseMarketplaceItemDto): Promise<PurchaseResponseDto> {
    const marketplaceItem = await this.repo.findById(dto.marketplace_item_id);
    if (!marketplaceItem) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }

    // Get buyer's membership
    const buyerBenefits = this.getMembershipBenefits(level);
    // Check buy limit (monthly for Free/Basic, unlimited for Plus/Premium)
    if (buyerBenefits.marketplace_buy_limit > 0) {
      // Count purchases this month
      const purchaseCountThisMonth = await this.purchaseHistoryService.countMonthlyPurchases(userId);
      if (purchaseCountThisMonth >= buyerBenefits.marketplace_buy_limit) {
        throw new AppException(ErrorCode.MARKETPLACE_BUY_LIMIT_EXCEEDED);
      }
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

    // Calculate final price with membership discount
    const discount = buyerBenefits.marketplace_discount || 0;
    const finalPrice = Math.floor(marketplaceItem.price * (1 - discount));

    const buyerInventory = await this.userInventoryService.findByUserId(userId);
    const userPoints = this.getUserPoints(buyerInventory);
    
    if (userPoints < finalPrice) {
      throw new AppException(ErrorCode.INSUFFICIENT_BALANCE);
    }

    // Deduct discounted price from buyer
    await this.userInventoryService.addReward(userId, `-${finalPrice}`);

    // Add full price to seller (không discount cho người bán)
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

    // Get buyer membership for tier name
    const membershipTierMap = {
      '-1': 'FREE',
      '0': 'BASIC',
      '1': 'PLUS',
      '2': 'PREMIUM',
    };
    const membershipTier = membershipTierMap[level.toString()] || 'UNKNOWN';

    return {
      message: 'Mua flashcard thành công',
      marketplace_item_id: marketplaceItem._id.toString(),
      purchased_flashcard_id: purchasedFlashcardId,
      purchased_deck_id: purchasedDeckId,
      discount_details: {
        original_price: marketplaceItem.price,
        discount_percentage: Math.round(discount * 100),
        discount_amount: marketplaceItem.price - finalPrice,
        final_price: finalPrice,
        remainingPoints: userPoints - finalPrice,
        membership_tier: membershipTier,
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
   /**
   * Get membership benefits for a specific level
   * @param level - Membership level (-1 to 2)
   * @returns Membership benefits
   */
  getMembershipBenefits(level: number): MembershipBenefits {
    switch (level) {
      case -1: // FREE
        return {
          marketplace_sell_limit: 0, // Không được bán
          marketplace_buy_limit: 3, // Tối đa 3 lần mua miễn phí
          marketplace_discount: 0, // Không giảm giá
          priority_listing: false,
        };
      case 0: // BASIC
        return {
          marketplace_sell_limit: 0, // Không được bán
          marketplace_buy_limit: 10, // Tối đa 10 lần mua/tháng
          marketplace_discount: 0.1, // Giảm 10%
          priority_listing: false,
        };
      case 1: // PLUS
        return {
          marketplace_sell_limit: 3, // Bán tối đa 3 flashcard/tháng
          marketplace_buy_limit: -1, // Không giới hạn
          marketplace_discount: 0.25, // Giảm 25%
          priority_listing: false,
        };
      case 2: // PREMIUM (BUSINESS)
        return {
          marketplace_sell_limit: -1, // Không giới hạn
          marketplace_buy_limit: -1, // Không giới hạn
          marketplace_discount: 0.3, // Giảm 30%
          priority_listing: true, // Ưu tiên hiển thị
        };
      default:
        return {
          marketplace_sell_limit: 0,
          marketplace_buy_limit: 3,
          marketplace_discount: 0,
          priority_listing: false,
        };
    }
  }

}