import { Injectable } from '@nestjs/common';
import { AxiosClient } from './axios-client';

@Injectable()
export class UserHttpClient {
  private readonly client = new AxiosClient('http://core-service:3000');

  async getUser(email: string): Promise<any> {
    const response = await this.client.get(`auth/get-info-by-email/${email}`);
    return response.data;
  }
}