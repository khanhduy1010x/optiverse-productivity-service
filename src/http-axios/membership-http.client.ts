import { Injectable } from '@nestjs/common';
import { AxiosClient } from './axios-client';

// Define interface for membership data from core service
export interface MembershipData {
  _id: string;
  user_id: string;
  package_id: string;
  level: number;
  name: string;
  start_date: Date;
  end_date: Date;
  status: string;
  benefits?: {
    marketplace_sell_limit: number;
    marketplace_buy_limit: number;
    marketplace_discount: number;
    priority_listing: boolean;
  };
}

// Define interface for membership benefits
export interface MembershipBenefits {
  marketplace_sell_limit: number;
  marketplace_buy_limit: number;
  marketplace_discount: number;
  priority_listing: boolean;
}

// Define type for the API response wrapper structure
interface ApiResponseWrapper<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable()
export class MembershipHttpClient {
  private readonly client = new AxiosClient('http://core-service:3000');

  /**
   * Get user membership level only (faster endpoint for quick checks)
   * @param userId - User ID
   * @returns Membership level or -1 for Free tier
   */
  async getUserMembershipLevel(userId: string): Promise<number> {
    try {
      const response = await this.client.get<ApiResponseWrapper<{ level: number }>>(
        `user-memberships/user/${userId}/level`,
      );

      if (response?.data?.data?.level !== undefined) {
        console.log(`User ${userId} has membership level:`, response.data.data.level);
        return response.data.data.level;
      }
      // Return -1 (Free tier) if no level found
      return -1;
    } catch (error) {
      console.error(`Error getting membership level for user ${userId}:`, error);
      // Return -1 (Free tier) on error
      return -1;
    }
  }

 
}
