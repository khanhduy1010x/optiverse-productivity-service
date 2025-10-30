import { Controller, Get, Req, Query } from '@nestjs/common';
import { PurchaseHistoryService } from './purchase-history.service';
import { Request } from 'express';

@Controller('purchase-history')
export class PurchaseHistoryController {
  constructor(private readonly purchaseHistoryService: PurchaseHistoryService) {}

  @Get('my-purchases')
  async getMyPurchases(@Req() req: Request, @Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    const userId = (req as any).userInfo?._id;
    return await this.purchaseHistoryService.findByBuyer(userId, page, limit);
  }

  @Get('my-sales')
  async getMySales(@Req() req: Request, @Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    const userId = (req as any).userInfo?._id;
    return await this.purchaseHistoryService.findBySeller(userId, page, limit);
  }
}
