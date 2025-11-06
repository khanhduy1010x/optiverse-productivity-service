import { Injectable } from '@nestjs/common';
import { AxiosClient } from './axios-client';

interface UserResponse {
  user_id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

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

    if (response?.data?.data) {
      return response.data.data;
    }

    return [];
  }

  async updateUserMembership(userId: string, packageId: string): Promise<any> {
    const response = await this.client.post('user-memberships/update', {
      userId,
      packageId,
    });
    return response.data;
  }

  async getMembershipPackageById(packageId: string): Promise<any> {
    const response = await this.client.get(
      `membership-packages/by-id/${packageId}`,
    );
    return response.data;
  }

  async getMembershipPackagesByIds(packageIds: string[]): Promise<any[]> {
    const response = await this.client.post<ApiResponseWrapper<any[]>>(
      'membership-packages/by-ids',
      { packageIds },
    );
    return response?.data?.data || [];
  }
}
