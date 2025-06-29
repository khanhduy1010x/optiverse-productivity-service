import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { ShareRepository } from './share.repository';
import { NoteService } from '../notes/note.service';
import { NoteFolderService } from '../note-folders/note-folder.service';
import { Share } from './share.schema';
import { ShareResponse } from './dto/response/ShareResponse.dto';
import { ShareUserDto } from './dto/request/ShareRequest.dto';
import { AppException } from '../common/exceptions/app.exception';
import { ErrorCode } from '../common/exceptions/error-code.enum';
import {
  RootItem,
  NoteFolderTree,
  NoteWithType,
} from '../note-folders/note-folder.schema';
import { UserHttpClient } from 'src/http-axios/user-http.client';
import { NoteGateway } from '../notes/note.gateway';
import { NoteRepository } from '../notes/note.repository';
import { NoteFolderRepository } from '../note-folders/note-folder.repository';
import { ApiResponse } from 'src/common/api-response';

@Injectable()
export class ShareService {
  constructor(
    private readonly shareRepository: ShareRepository,
    private readonly noteService: NoteService,
    private readonly noteFolderService: NoteFolderService,
    private readonly userHttpClient: UserHttpClient,
    private readonly noteRepository: NoteRepository,
    private readonly noteFolderRepository: NoteFolderRepository,
    private readonly noteGateway?: NoteGateway,
  ) {}

  private getNoteGateway(): NoteGateway | undefined {
    return this.noteGateway;
  }

  async shareResource(
    ownerId: string,
    resourceType: string,
    resourceId: string,
    users: ShareUserDto[],
  ): Promise<ShareResponse> {
    await this.validateResourceOwnership(resourceType, resourceId, ownerId);

    const existingShare = await this.shareRepository.findShareByResourceId(
      resourceType,
      resourceId,
    );

    let share: Share;

    if (existingShare) {
      const existingUserIds = existingShare.shared_with.map((user) =>
        user.user_id.toString(),
      );

      const newUsers = users.filter(
        (user) => !existingUserIds.includes(user.user_id),
      );

      if (newUsers.length > 0) {
        const updatedShare = await this.shareRepository.addUsersToShare(
          existingShare._id.toString(),
          newUsers,
        );

        if (!updatedShare) {
          throw new AppException(ErrorCode.UPDATE_SHARE_FAILED);
        }

        share = updatedShare;
      } else {
        share = existingShare;
      }
    } else {
      share = await this.shareRepository.createShare(
        ownerId,
        resourceType,
        resourceId,
        users,
      );
    }

    return new ShareResponse(share);
  }

  async updateSharedUsers(
    ownerId: string,
    resourceType: string,
    resourceId: string,
    users: ShareUserDto[],
  ): Promise<ShareResponse> {
    await this.validateResourceOwnership(resourceType, resourceId, ownerId);

    const existingShare = await this.shareRepository.findShareByResourceId(
      resourceType,
      resourceId,
    );

    if (!existingShare) {
      throw new AppException(ErrorCode.SHARE_NOT_FOUND);
    }

    if (users.length === 0) {
      await this.shareRepository.deleteShare(existingShare._id.toString());
      return new ShareResponse({
        ...existingShare,
        shared_with: [],
      } as Share);
    }

    const currentUsers = existingShare.shared_with.reduce((map, user) => {
      map.set(user.user_id.toString(), user.permission);
      return map;
    }, new Map<string, string>());

    const usersWithChangedPermissions = users.filter((user) => {
      const currentPermission = currentUsers.get(user.user_id);
      return currentPermission && currentPermission !== user.permission;
    });

    const updatedShare = await this.shareRepository.updateShare(
      existingShare._id.toString(),
      users,
    );

    if (!updatedShare) {
      throw new AppException(ErrorCode.UPDATE_SHARE_FAILED);
    }

    if (usersWithChangedPermissions.length > 0) {
      try {
        const server = this.getNoteGateway()?.server;
        if (server) {
          console.log(
            `Sending permission_changed events for ${usersWithChangedPermissions.length} users`,
          );

          for (const user of usersWithChangedPermissions) {
            const userRoom = `user:${user.user_id}`;
            console.log(
              `Sending permission_changed to user ${user.user_id} with permission ${user.permission}`,
            );

            server.to(userRoom).emit('permission_changed', {
              userId: user.user_id,
              resourceType,
              resourceId,
              permission: user.permission,
              shouldRefreshShared: true,
            });
          }
        } else {
          console.error(
            'NoteGateway server not available for sending permission_changed events',
          );
        }
      } catch (error) {
        console.error(
          'Error sending permission change notification:',
          error.message,
        );
      }
    }

    return new ShareResponse(updatedShare);
  }

  async removeUserFromShare(
    ownerId: string,
    resourceType: string,
    resourceId: string,
    userId: string,
  ): Promise<ShareResponse> {
    await this.validateResourceOwnership(resourceType, resourceId, ownerId);

    const existingShare = await this.shareRepository.findShareByResourceId(
      resourceType,
      resourceId,
    );

    if (!existingShare) {
      throw new AppException(ErrorCode.SHARE_NOT_FOUND);
    }

    const updatedShare = await this.shareRepository.removeUserFromShare(
      existingShare._id.toString(),
      userId,
    );

    if (!updatedShare) {
      throw new AppException(ErrorCode.UPDATE_SHARE_FAILED);
    }

    if (updatedShare.shared_with.length === 0) {
      await this.shareRepository.deleteShare(updatedShare._id.toString());
      return new ShareResponse({
        ...updatedShare,
        shared_with: [],
      } as Share);
    }

    return new ShareResponse(updatedShare);
  }

  async getSharesSharedWithUser(userId: string): Promise<ShareResponse[]> {
    const shares = await this.shareRepository.getSharesSharedWithUser(userId);
    return shares.map((share) => new ShareResponse(share));
  }

  async getSharesSharedWithUserAsRootItems(
    userId: string,
  ): Promise<RootItem[]> {
    const shares = await this.shareRepository.getSharesSharedWithUser(userId);
    console.log('shared: ', shares);
    const ownerIds = shares.map((share) => share.owner_id.toString());
    const arrayOwnerInfo = await this.userHttpClient.getUsersByIds(ownerIds);
    const ownerInfoMap = new Map(
      arrayOwnerInfo.map((user) => [user.user_id.toString(), user]),
    );

    const sharedUserIds = new Set<string>();
    for (const share of shares) {
      for (const sharedUser of share.shared_with) {
        sharedUserIds.add(sharedUser.user_id.toString());
      }
    }

    let sharedUserInfoMap = new Map<string, any>();
    if (sharedUserIds.size > 0) {
      try {
        const sharedUserInfo = await this.userHttpClient.getUsersByIds(
          Array.from(sharedUserIds),
        );
        sharedUserInfoMap = new Map(
          sharedUserInfo.map((user) => [user.user_id.toString(), user]),
        );
      } catch (error) {
        console.error('Error fetching shared user information:', error.message);
      }
    }

    const rootItems: RootItem[] = [];

    for (const share of shares) {
      const userPermission =
        share.shared_with.find((u) => u.user_id.toString() === userId)
          ?.permission || 'view';
      const ownerIdStr = share.owner_id.toString();
      const ownerInfo = ownerInfoMap.get(ownerIdStr);

      const sharedWithDetails = share.shared_with.map((user) => {
        const userInfo = sharedUserInfoMap.get(user.user_id.toString());
        return {
          user_id: user.user_id.toString(),
          permission: user.permission,
          shared_at: user.shared_at,
          user_info: userInfo
            ? {
                id: userInfo.user_id,
                name: userInfo.full_name,
                email: userInfo.email,
                avatar_url: userInfo.avatar_url,
              }
            : null,
        };
      });

      if (share.resource_type === 'note') {
        try {
          const note = await this.noteService.getNotebyId(
            share.resource_id.toString(),
          );
          if (note) {
            const noteWithType: NoteWithType = {
              ...note,
              type: 'file',
              isShared: true,
              sharedBy: share.owner_id.toString(),
              permission: userPermission as 'view' | 'edit',
              sharedWith: sharedWithDetails,
              owner_info: {
                id: ownerInfo?.user_id.toString(),
                name: ownerInfo?.full_name,
                email: ownerInfo?.email,
                avatar_url: ownerInfo?.avatar_url,
              },
            };
            rootItems.push(noteWithType);
          }
        } catch (error) {
          console.error(
            `Error fetching note ${share.resource_id}: ${error.message}`,
          );
        }
      } else if (share.resource_type === 'folder') {
        try {
          const folder = await this.noteFolderService.getFolderById(
            share.resource_id.toString(),
          );
          if (folder) {
            const folderWithSharedInfo: NoteFolderTree = {
              ...folder,
              type: 'folder',
              isShared: true,
              sharedBy: share.owner_id.toString(),
              permission: userPermission as 'view' | 'edit',
              sharedWith: sharedWithDetails,
              owner_info: {
                id: ownerInfo?.user_id.toString(),
                name: ownerInfo?.full_name,
                email: ownerInfo?.email,
                avatar_url: ownerInfo?.avatar_url,
              },
            };

            this.applyPermissionToFolderContents(
              folderWithSharedInfo,
              userPermission as 'view' | 'edit',
              share.owner_id.toString(),
              ownerInfo,
            );

            rootItems.push(folderWithSharedInfo);
          }
        } catch (error) {
          console.error(
            `Error fetching folder ${share.resource_id}: ${error.message}`,
          );
        }
      }
    }

    return rootItems;
  }

  async getSharesByOwnerId(ownerId: string): Promise<ShareResponse[]> {
    const shares = await this.shareRepository.getSharesByOwnerId(ownerId);

    const sharedUserIds = new Set<string>();
    for (const share of shares) {
      for (const sharedUser of share.shared_with) {
        sharedUserIds.add(sharedUser.user_id.toString());
      }
    }

    let sharedUserInfoMap = new Map<string, any>();
    if (sharedUserIds.size > 0) {
      try {
        const sharedUserInfo = await this.userHttpClient.getUsersByIds(
          Array.from(sharedUserIds),
        );
        sharedUserInfoMap = new Map(
          sharedUserInfo.map((user) => [user.user_id.toString(), user]),
        );
      } catch (error) {
        console.error('Error fetching shared user information:', error.message);
      }
    }

    return shares.map((share) => {
      const shareResponse = new ShareResponse(share);

      shareResponse.shared_with = shareResponse.shared_with.map((user) => {
        const userInfo = sharedUserInfoMap.get(user.user_id);
        return {
          ...user,
          user_info: userInfo
            ? {
                id: userInfo.user_id,
                name: userInfo.full_name,
                email: userInfo.email,
                avatar_url: userInfo.avatar_url,
              }
            : null,
        };
      });

      return shareResponse;
    });
  }

  async getSharedResourceDetail(
    resourceType: string,
    resourceId: string,
    userId: string,
  ): Promise<RootItem | null> {
    const share = await this.shareRepository.findShareByResourceIdAndUserId(
      resourceType,
      resourceId,
      userId,
    );

    if (!share) {
      return null;
    }

    const userPermission =
      share.shared_with.find((u) => u.user_id.toString() === userId)
        ?.permission || 'view';

    interface UserInfoResponse {
      user_id: string;
      email: string;
      full_name?: string;
      avatar_url?: string;
    }

    let ownerInfo: UserInfoResponse | null = null;
    try {
      const ownerInfoArray = await this.userHttpClient.getUsersByIds([
        share.owner_id.toString(),
      ]);
      if (ownerInfoArray && ownerInfoArray.length > 0) {
        ownerInfo = ownerInfoArray[0];
      }
    } catch (error) {
      console.error(`Error fetching owner information: ${error.message}`);
    }

    const sharedUserIds = share.shared_with.map((user) =>
      user.user_id.toString(),
    );

    let sharedUserInfoMap = new Map<string, UserInfoResponse>();
    if (sharedUserIds.length > 0) {
      try {
        const sharedUserInfo =
          await this.userHttpClient.getUsersByIds(sharedUserIds);
        sharedUserInfoMap = new Map(
          sharedUserInfo.map((user) => [user.user_id.toString(), user]),
        );
      } catch (error) {
        console.error('Error fetching shared user information:', error.message);
      }
    }

    const sharedWithDetails = share.shared_with.map((user) => {
      const userInfo = sharedUserInfoMap.get(user.user_id.toString());
      return {
        user_id: user.user_id.toString(),
        permission: user.permission,
        shared_at: user.shared_at,
        user_info: userInfo
          ? {
              id: userInfo.user_id,
              name: userInfo.full_name,
              email: userInfo.email,
              avatar_url: userInfo.avatar_url,
            }
          : null,
      };
    });

    if (resourceType === 'note') {
      try {
        const note = await this.noteService.getNotebyId(resourceId);
        if (note) {
          const noteWithType: NoteWithType = {
            ...note,
            type: 'file',
            isShared: true,
            sharedBy: share.owner_id.toString(),
            permission: userPermission as 'view' | 'edit',
            sharedWith: sharedWithDetails,
            owner_info: ownerInfo
              ? {
                  id: ownerInfo.user_id.toString(),
                  name: ownerInfo.full_name,
                  email: ownerInfo.email,
                  avatar_url: ownerInfo.avatar_url,
                }
              : undefined,
          };
          return noteWithType;
        }
      } catch (error) {
        console.error(`Error fetching note ${resourceId}: ${error.message}`);
      }
    } else if (resourceType === 'folder') {
      try {
        const folder = await this.noteFolderService.getFolderById(resourceId);
        if (folder) {
          const folderWithSharedInfo: NoteFolderTree = {
            ...folder,
            type: 'folder',
            isShared: true,
            sharedBy: share.owner_id.toString(),
            permission: userPermission as 'view' | 'edit',
            sharedWith: sharedWithDetails,
            owner_info: ownerInfo
              ? {
                  id: ownerInfo.user_id.toString(),
                  name: ownerInfo.full_name,
                  email: ownerInfo.email,
                  avatar_url: ownerInfo.avatar_url,
                }
              : undefined,
          };

          this.applyPermissionToFolderContents(
            folderWithSharedInfo,
            userPermission as 'view' | 'edit',
            share.owner_id.toString(),
            ownerInfo,
          );

          return folderWithSharedInfo;
        }
      } catch (error) {
        console.error(`Error fetching folder ${resourceId}: ${error.message}`);
      }
    }

    return null;
  }

  private applyPermissionToFolderContents(
    folder: NoteFolderTree,
    permission: 'view' | 'edit',
    ownerId: string,
    ownerInfo?: any,
  ): void {
    if (folder.files && folder.files.length > 0) {
      folder.files = folder.files.map((file) => ({
        ...file,
        isShared: true,
        sharedBy: ownerId,
        permission: permission,
        owner_info: {
          id: folder.owner_info?.id || ownerId,
          name: ownerInfo?.full_name || folder.owner_info?.name,
          email: ownerInfo?.email || folder.owner_info?.email,
          avatar_url: ownerInfo?.avatar_url || folder.owner_info?.avatar_url,
        },
      }));
    }

    if (folder.subfolders && folder.subfolders.length > 0) {
      folder.subfolders = folder.subfolders.map((subfolder) => {
        const subfolderWithPermission = {
          ...subfolder,
          isShared: true,
          sharedBy: ownerId,
          permission: permission,
          owner_info: {
            id: folder.owner_info?.id || ownerId,
            name: ownerInfo?.full_name || folder.owner_info?.name,
            email: ownerInfo?.email || folder.owner_info?.email,
            avatar_url: ownerInfo?.avatar_url || folder.owner_info?.avatar_url,
          },
        };

        this.applyPermissionToFolderContents(
          subfolderWithPermission,
          permission,
          ownerId,
          ownerInfo,
        );

        return subfolderWithPermission;
      });
    }
  }

  private async validateResourceOwnership(
    resourceType: string,
    resourceId: string,
    ownerId: string,
  ): Promise<void> {
    if (resourceType === 'note') {
      const note = await this.noteService.getNotebyId(resourceId);
      if (!note) {
        throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
      }
      if (note.user_id.toString() !== ownerId) {
        throw new AppException(ErrorCode.PERMISSION_DENIED);
      }
    } else if (resourceType === 'folder') {
      const folder = await this.noteFolderService.getFolderById(resourceId);
      if (!folder) {
        throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
      }
      if (folder.user_id.toString() !== ownerId) {
        throw new AppException(ErrorCode.PERMISSION_DENIED);
      }
    } else {
      throw new AppException(ErrorCode.INVALID_RESOURCE_TYPE);
    }
  }

  async leaveSharedResource(
    resourceType: string,
    resourceId: string,
    userInfo: any,
  ): Promise<ApiResponse<null>> {
    try {
      // Kiểm tra xem resource có tồn tại không
      let resource;
      if (resourceType === 'note') {
        resource = await this.noteRepository.getNoteByID(resourceId);
      } else if (resourceType === 'folder') {
        resource =
          await this.noteFolderRepository.getNoteFolderById(resourceId);
      }

      if (!resource) {
        throw new NotFoundException(`${resourceType} not found`);
      }

      // Tìm share document
      const shareDoc = await this.shareRepository.findShareByResourceId(
        resourceType,
        resourceId,
      );

      if (!shareDoc) {
        throw new NotFoundException('Share document not found');
      }

      // Kiểm tra xem người dùng có trong danh sách shared_with không
      const userIndex = shareDoc.shared_with.findIndex(
        (user) => user.user_id.toString() === userInfo.userId,
      );

      if (userIndex === -1) {
        throw new BadRequestException('User is not in shared list');
      }

      // Loại bỏ người dùng khỏi danh sách shared_with
      shareDoc.shared_with.splice(userIndex, 1);

      // Nếu không còn ai được share, xóa document share
      if (shareDoc.shared_with.length === 0) {
        await this.shareRepository.deleteShare(shareDoc._id.toString());
      } else {
        // Ngược lại, cập nhật document share
        await this.shareRepository.updateShare(
          shareDoc._id.toString(),
          shareDoc.shared_with.map((user) => ({
            user_id: user.user_id.toString(),
            permission: user.permission,
          })),
        );
      }

      return new ApiResponse(null);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to leave shared resource');
    }
  }
}
