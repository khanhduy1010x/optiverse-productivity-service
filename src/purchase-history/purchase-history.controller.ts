import { Controller, Get, Req, Query } from '@nestjs/common';
import { PurchaseHistoryService } from './purchase-history.service';
import { Request } from 'express';
import { ApiResponse } from 'src/common/api-response';

@Controller('purchase-history')
export class PurchaseHistoryController {
  constructor(private readonly purchaseHistoryService: PurchaseHistoryService) {}

  @Get('my-purchases')
  async getMyPurchases(@Req() req: Request, @Query('page') page: number = 1, @Query('limit') limit: number = 10): Promise<ApiResponse<any>> {
    const userId = (req as any).userInfo?.userId || (req as any).userInfo?._id;
    const result = await this.purchaseHistoryService.findByBuyer(userId, page, limit);
    return new ApiResponse(result);
  }

  @Get('my-sales')
  async getMySales(@Req() req: Request, @Query('page') page: number = 1, @Query('limit') limit: number = 10): Promise<ApiResponse<any>> {
    const userId = (req as any).userInfo?.userId || (req as any).userInfo?._id;
    const result = await this.purchaseHistoryService.findBySeller(userId, page, limit);
    return new ApiResponse(result);
  }
}
