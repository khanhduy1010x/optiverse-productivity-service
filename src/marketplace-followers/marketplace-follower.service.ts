import { Injectable } from '@nestjs/common';
import { MarketplaceFollowerRepository } from './marketplace-follower.repository';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { UserHttpClient } from 'src/http-axios/user-http.client';

@Injectable()
export class MarketplaceFollowerService {
  constructor(
    private readonly followerRepo: MarketplaceFollowerRepository,
    private readonly userHttpClient: UserHttpClient,
  ) {}

  /**
   * Follow creator
   */
  async followCreator(followerId: string, creatorId: string): Promise<{ message: string }> {
    // Không cho phép follow chính mình
    if (followerId === creatorId) {
      throw new AppException(ErrorCode.INVALID_REQUEST);
    }

    // Kiểm tra đã follow chưa
    const alreadyFollowing = await this.followerRepo.isFollowing(followerId, creatorId);
    if (alreadyFollowing) {
      throw new AppException(ErrorCode.DUPLICATE_RATING); // Tạm dùng DUPLICATE_RATING
    }

    // Follow creator
    await this.followerRepo.follow(followerId, creatorId);

    return { message: 'Đã theo dõi creator này' };
  }

  /**
   * Unfollow creator
   */
  async unfollowCreator(followerId: string, creatorId: string): Promise<{ message: string }> {
    const unfollowed = await this.followerRepo.unfollow(followerId, creatorId);
    
    if (!unfollowed) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }

    return { message: 'Đã bỏ theo dõi creator này' };
  }

  /**
   * Toggle follow (follow nếu chưa follow, unfollow nếu đã follow)
   */
  async toggleFollow(followerId: string, creatorId: string): Promise<{ 
    isFollowing: boolean; 
    message: string 
  }> {
    const isFollowing = await this.followerRepo.isFollowing(followerId, creatorId);

    if (isFollowing) {
      await this.followerRepo.unfollow(followerId, creatorId);
      return { 
        isFollowing: false, 
        message: 'Đã bỏ theo dõi creator này' 
      };
    } else {
      // Không cho phép follow chính mình
      if (followerId === creatorId) {
        throw new AppException(ErrorCode.INVALID_REQUEST);
      }

      await this.followerRepo.follow(followerId, creatorId);
      return { 
        isFollowing: true, 
        message: 'Đã theo dõi creator này' 
      };
    }
  }

  /**
   * Kiểm tra đã follow creator chưa
   */
  async isFollowing(followerId: string, creatorId: string): Promise<{ isFollowing: boolean }> {
    const isFollowing = await this.followerRepo.isFollowing(followerId, creatorId);
    return { isFollowing };
  }

  /**
   * Lấy danh sách creators mà user đang follow
   */
  async getFollowingList(
    followerId: string,
    page: number = 1,
    limit: number = 10,
    search: string = '',
  ): Promise<any> {
    // Nếu có search, lấy toàn bộ data rồi filter
    if (search && search.trim()) {
      const { following } = await this.followerRepo.getFollowingList(
        followerId,
        1,
        999999, // Lấy toàn bộ
        search
      );

      // Lấy thông tin chi tiết của creators
      const creatorIds = following.map(f => f.creator_id.toString());
      const creatorsInfo = await this.userHttpClient.getUsersByIds(creatorIds);
      
      // Filter by search
      const searchLower = search.toLowerCase();
      let filtered = following.filter(f => {
        const userInfo = creatorsInfo.find(u => u.user_id === f.creator_id.toString());
        return userInfo?.full_name?.toLowerCase().includes(searchLower);
      });

      // Paginate results
      const skip = (page - 1) * limit;
      const paginatedResults = filtered.slice(skip, skip + limit);

      // Map response
      const enrichedFollowing = paginatedResults.map(f => ({
        creator_id: creatorsInfo.find(u => u.user_id === f.creator_id.toString()) || {
          user_id: f.creator_id,
          full_name: 'Unknown',
          avatar_url: null,
        },
      }));

      return { 
        following: enrichedFollowing, 
        total: filtered.length // Tổng số sau filter
      };
    }

    // Nếu không có search, lấy theo pagination thường
    const { following, total } = await this.followerRepo.getFollowingList(
      followerId,
      page,
      limit,
      search
    );

    // Lấy thông tin chi tiết của creators
    const creatorIds = following.map(f => f.creator_id.toString());
    const creatorsInfo = await this.userHttpClient.getUsersByIds(creatorIds);
    
    // Map response
    const enrichedFollowing = following.map(f => ({
      creator_id: creatorsInfo.find(u => u.user_id === f.creator_id.toString()) || {
        user_id: f.creator_id,
        full_name: 'Unknown',
        avatar_url: null,
      },
    }));

    return { 
      following: enrichedFollowing, 
      total
    };
  }

  /**
   * Lấy danh sách followers của creator
   */
  async getFollowers(
    creatorId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<any> {
    const { followers, total } = await this.followerRepo.getFollowers(
      creatorId,
      page,
      limit
    );

    // Lấy thông tin chi tiết của followers
    const followerIds = followers.map(f => f.follower_id.toString());
    const followersInfo = await this.userHttpClient.getUsersByIds(followerIds);
    
    // Map thông tin vào response (không include email)
    const enrichedFollowers = followers.map(f => ({
      ...f,
      follower_id: followersInfo.find(u => u.user_id === f.follower_id.toString()) || {
        _id: f.follower_id,
        full_name: 'Unknown',
        avatar_url: null,
      },
    }));

    return { followers: enrichedFollowers, total };
  }

  /**
   * Đếm số followers của creator
   */
  async getFollowerCount(creatorId: string): Promise<number> {
    return this.followerRepo.getFollowerCount(creatorId);
  }

  /**
   * Đếm số creators mà user đang follow
   */
  async getFollowingCount(followerId: string): Promise<number> {
    return this.followerRepo.getFollowingCount(followerId);
  }
}
