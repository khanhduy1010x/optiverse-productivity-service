import { Injectable } from '@nestjs/common';
import { AxiosClient } from './axios-client';

// Define interface for user data from core service
interface UserResponse {
  user_id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

// Define type for the API response wrapper structure
interface ApiResponseWrapper<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable()
export class UserHttpClient {
  private readonly client = new AxiosClient('http://core-service:3000');

  async getUser(email: string): Promise<any> {
    const response = await this.client.get(`auth/get-info-by-email/${email}`);
    return response.data;
  }

  async getUsersByIds(userIds: string[]): Promise<UserResponse[]> {
    const response = await this.client.post<ApiResponseWrapper<UserResponse[]>>(
      'auth/get-users-by-ids',
      { userIds },
    );

    // Check if response and data properties exist
    if (response?.data?.data) {
      return response.data.data;
    }

    // Return empty array if no data
    return [];
  }
}
