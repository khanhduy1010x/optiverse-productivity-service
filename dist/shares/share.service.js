"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShareService = void 0;
const common_1 = require("@nestjs/common");
const share_repository_1 = require("./share.repository");
const note_service_1 = require("../notes/note.service");
const note_folder_service_1 = require("../note-folders/note-folder.service");
const ShareResponse_dto_1 = require("./dto/response/ShareResponse.dto");
const app_exception_1 = require("../common/exceptions/app.exception");
const error_code_enum_1 = require("../common/exceptions/error-code.enum");
const user_http_client_1 = require("../http-axios/user-http.client");
const notification_http_client_1 = require("../http-axios/notification-http.client");
const note_gateway_1 = require("../notes/note.gateway");
const note_repository_1 = require("../notes/note.repository");
const note_folder_repository_1 = require("../note-folders/note-folder.repository");
const api_response_1 = require("../common/api-response");
let ShareService = class ShareService {
    constructor(shareRepository, noteService, noteFolderService, userHttpClient, noteRepository, noteFolderRepository, notificationHttpClient, noteGateway) {
        this.shareRepository = shareRepository;
        this.noteService = noteService;
        this.noteFolderService = noteFolderService;
        this.userHttpClient = userHttpClient;
        this.noteRepository = noteRepository;
        this.noteFolderRepository = noteFolderRepository;
        this.notificationHttpClient = notificationHttpClient;
        this.noteGateway = noteGateway;
    }
    getNoteGateway() {
        return this.noteGateway;
    }
    async shareResource(ownerId, resourceType, resourceId, users) {
        await this.validateResourceOwnership(resourceType, resourceId, ownerId);
        let resourceName = '';
        if (resourceType === 'note') {
            try {
                const note = await this.noteRepository.getNoteByID(resourceId);
                if (note) {
                    resourceName = note.title;
                }
            }
            catch (error) {
                console.error('Error fetching note:', error);
            }
        }
        else if (resourceType === 'folder') {
            try {
                const folder = await this.noteFolderRepository.getNoteFolderById(resourceId);
                if (folder) {
                    resourceName = folder.name;
                }
            }
            catch (error) {
                console.error('Error fetching folder:', error);
            }
        }
        let ownerInfo = null;
        try {
            const ownerInfoResponse = await this.userHttpClient.getUsersByIds([
                ownerId,
            ]);
            if (ownerInfoResponse && ownerInfoResponse.length > 0) {
                ownerInfo = ownerInfoResponse[0];
            }
        }
        catch (error) {
            console.error('Error fetching owner info:', error);
        }
        const ownerName = ownerInfo?.full_name || 'User';
        const existingShare = await this.shareRepository.findShareByResourceId(resourceType, resourceId);
        let share;
        if (existingShare) {
            const existingUserIds = existingShare.shared_with.map((user) => user.user_id.toString());
            const newUsers = users.filter((user) => !existingUserIds.includes(user.user_id));
            if (newUsers.length > 0) {
                const updatedShare = await this.shareRepository.addUsersToShare(existingShare._id.toString(), newUsers);
                if (!updatedShare) {
                    throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.UPDATE_SHARE_FAILED);
                }
                share = updatedShare;
                this.sendShareNotificationEmails(newUsers, resourceType, resourceName, ownerName);
            }
            else {
                share = existingShare;
            }
        }
        else {
            share = await this.shareRepository.createShare(ownerId, resourceType, resourceId, users);
            this.sendShareNotificationEmails(users, resourceType, resourceName, ownerName);
        }
        return new ShareResponse_dto_1.ShareResponse(share);
    }
    async sendShareNotificationEmails(users, resourceType, resourceName, ownerName) {
        try {
            const userIds = users.map((user) => user.user_id);
            const userInfos = await this.userHttpClient.getUsersByIds(userIds);
            if (!userInfos || userInfos.length === 0) {
                console.error('No user information found for notification');
                return;
            }
            const permissionMap = new Map();
            users.forEach((user) => {
                permissionMap.set(user.user_id, user.permission);
            });
            for (const userInfo of userInfos) {
                if (userInfo.email) {
                    const permission = permissionMap.get(userInfo.user_id) || 'view';
                    await this.notificationHttpClient.sendShareNotification(userInfo.email, resourceType, resourceName, ownerName, permission, userInfo.user_id);
                    console.log(`Share notification email sent to ${userInfo.email}`);
                }
            }
        }
        catch (error) {
            console.error('Error sending share notification emails:', error);
        }
    }
    async updateSharedUsers(ownerId, resourceType, resourceId, users) {
        await this.validateResourceOwnership(resourceType, resourceId, ownerId);
        let resourceName = '';
        if (resourceType === 'note') {
            try {
                const note = await this.noteRepository.getNoteByID(resourceId);
                if (note) {
                    resourceName = note.title;
                }
            }
            catch (error) {
                console.error('Error fetching note:', error);
            }
        }
        else if (resourceType === 'folder') {
            try {
                const folder = await this.noteFolderRepository.getNoteFolderById(resourceId);
                if (folder) {
                    resourceName = folder.name;
                }
            }
            catch (error) {
                console.error('Error fetching folder:', error);
            }
        }
        let ownerInfo = null;
        try {
            const ownerInfoResponse = await this.userHttpClient.getUsersByIds([
                ownerId,
            ]);
            if (ownerInfoResponse && ownerInfoResponse.length > 0) {
                ownerInfo = ownerInfoResponse[0];
            }
        }
        catch (error) {
            console.error('Error fetching owner info:', error);
        }
        const ownerName = ownerInfo?.full_name || 'User';
        const existingShare = await this.shareRepository.findShareByResourceId(resourceType, resourceId);
        if (!existingShare) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.SHARE_NOT_FOUND);
        }
        if (users.length === 0) {
            await this.shareRepository.deleteShare(existingShare._id.toString());
            return new ShareResponse_dto_1.ShareResponse({
                ...existingShare,
                shared_with: [],
            });
        }
        const currentUsers = existingShare.shared_with.reduce((map, user) => {
            map.set(user.user_id.toString(), user.permission);
            return map;
        }, new Map());
        const usersWithChangedPermissions = users.filter((user) => {
            const currentPermission = currentUsers.get(user.user_id);
            return currentPermission && currentPermission !== user.permission;
        });
        const updatedShare = await this.shareRepository.updateShare(existingShare._id.toString(), users);
        if (!updatedShare) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.UPDATE_SHARE_FAILED);
        }
        if (usersWithChangedPermissions.length > 0) {
            try {
                const server = this.getNoteGateway()?.server;
                if (server) {
                    console.log(`Sending permission_changed events for ${usersWithChangedPermissions.length} users`);
                    for (const user of usersWithChangedPermissions) {
                        const userRoom = `user:${user.user_id}`;
                        console.log(`Sending permission_changed to user ${user.user_id} with permission ${user.permission}`);
                        server.to(userRoom).emit('permission_changed', {
                            userId: user.user_id,
                            resourceType,
                            resourceId,
                            permission: user.permission,
                            shouldRefreshShared: true,
                        });
                    }
                }
                else {
                    console.error('NoteGateway server not available for sending permission_changed events');
                }
            }
            catch (error) {
                console.error('Error sending permission change notification:', error.message);
            }
            this.sendPermissionChangedEmails(usersWithChangedPermissions, resourceType, resourceName, ownerName);
        }
        return new ShareResponse_dto_1.ShareResponse(updatedShare);
    }
    async sendPermissionChangedEmails(users, resourceType, resourceName, ownerName) {
        try {
            const userIds = users.map((user) => user.user_id);
            const userInfos = await this.userHttpClient.getUsersByIds(userIds);
            if (!userInfos || userInfos.length === 0) {
                console.error('No user information found for permission change notification');
                return;
            }
            const permissionMap = new Map();
            users.forEach((user) => {
                permissionMap.set(user.user_id, user.permission);
            });
            for (const userInfo of userInfos) {
                if (userInfo.email) {
                    const permission = permissionMap.get(userInfo.user_id) || 'view';
                    const subject = `Permission changed`;
                    const content = `
            ${ownerName} has changed your access permission for the ${resourceType === 'note' ? 'note' : 'folder'} "${resourceName}".\n
            You now have ${permission === 'view' ? 'view' : 'edit'} permission for this resource.\n
            Please log in to the application to access it.
          `;
                    await this.notificationHttpClient.sendEmail(userInfo.email, subject, content, notification_http_client_1.ActionType.NOTE, userInfo.user_id);
                    console.log(`Permission change notification email sent to ${userInfo.email}`);
                }
            }
        }
        catch (error) {
            console.error('Error sending permission change notification emails:', error);
        }
    }
    async removeUserFromShare(ownerId, resourceType, resourceId, userId) {
        await this.validateResourceOwnership(resourceType, resourceId, ownerId);
        let resourceName = '';
        if (resourceType === 'note') {
            try {
                const note = await this.noteRepository.getNoteByID(resourceId);
                if (note) {
                    resourceName = note.title;
                }
            }
            catch (error) {
                console.error('Error fetching note:', error);
            }
        }
        else if (resourceType === 'folder') {
            try {
                const folder = await this.noteFolderRepository.getNoteFolderById(resourceId);
                if (folder) {
                    resourceName = folder.name;
                }
            }
            catch (error) {
                console.error('Error fetching folder:', error);
            }
        }
        let ownerInfo = null;
        try {
            const ownerInfoResponse = await this.userHttpClient.getUsersByIds([
                ownerId,
            ]);
            if (ownerInfoResponse && ownerInfoResponse.length > 0) {
                ownerInfo = ownerInfoResponse[0];
            }
        }
        catch (error) {
            console.error('Error fetching owner info:', error);
        }
        const ownerName = ownerInfo?.full_name || 'User';
        let removedUserInfo = null;
        try {
            const userInfoResponse = await this.userHttpClient.getUsersByIds([
                userId,
            ]);
            if (userInfoResponse && userInfoResponse.length > 0) {
                removedUserInfo = userInfoResponse[0];
            }
        }
        catch (error) {
            console.error('Error fetching removed user info:', error);
        }
        const existingShare = await this.shareRepository.findShareByResourceId(resourceType, resourceId);
        if (!existingShare) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.SHARE_NOT_FOUND);
        }
        const updatedShare = await this.shareRepository.removeUserFromShare(existingShare._id.toString(), userId);
        if (!updatedShare) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.UPDATE_SHARE_FAILED);
        }
        if (removedUserInfo && removedUserInfo.email) {
            try {
                const subject = `Access revoked`;
                const content = `
          ${ownerName} has revoked your access to the ${resourceType === 'note' ? 'note' : 'folder'} "${resourceName}".\n
          You will no longer be able to access this resource.
        `;
                await this.notificationHttpClient.sendEmail(removedUserInfo.email, subject, content, notification_http_client_1.ActionType.NOTE, removedUserInfo.user_id);
                console.log(`Access removal notification email sent to ${removedUserInfo.email}`);
            }
            catch (error) {
                console.error('Error sending access removal notification email:', error);
            }
        }
        console.log('error: ', updatedShare);
        if (updatedShare.shared_with.length === 0) {
            await this.shareRepository.deleteShare(updatedShare._id.toString());
            return new ShareResponse_dto_1.ShareResponse({
                _id: updatedShare._id,
                owner_id: updatedShare.owner_id,
                resource_type: updatedShare.resource_type,
                resource_id: updatedShare.resource_id,
                shared_with: [],
                createdAt: updatedShare.createdAt || new Date(),
                updatedAt: updatedShare.updatedAt || new Date(),
            });
        }
        return new ShareResponse_dto_1.ShareResponse(updatedShare);
    }
    async getSharesSharedWithUser(userId) {
        const shares = await this.shareRepository.getSharesSharedWithUser(userId);
        return shares.map((share) => new ShareResponse_dto_1.ShareResponse(share));
    }
    async getSharesSharedWithUserAsRootItems(userId) {
        const shares = await this.shareRepository.getSharesSharedWithUser(userId);
        console.log('shared: ', shares);
        const ownerIds = shares.map((share) => share.owner_id.toString());
        const arrayOwnerInfo = await this.userHttpClient.getUsersByIds(ownerIds);
        const ownerInfoMap = new Map(arrayOwnerInfo.map((user) => [user.user_id.toString(), user]));
        const sharedUserIds = new Set();
        for (const share of shares) {
            for (const sharedUser of share.shared_with) {
                sharedUserIds.add(sharedUser.user_id.toString());
            }
        }
        let sharedUserInfoMap = new Map();
        if (sharedUserIds.size > 0) {
            try {
                const sharedUserInfo = await this.userHttpClient.getUsersByIds(Array.from(sharedUserIds));
                sharedUserInfoMap = new Map(sharedUserInfo.map((user) => [user.user_id.toString(), user]));
            }
            catch (error) {
                console.error('Error fetching shared user information:', error.message);
            }
        }
        const rootItems = [];
        for (const share of shares) {
            const userPermission = share.shared_with.find((u) => u.user_id.toString() === userId)
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
                    const note = await this.noteService.getNotebyId(share.resource_id.toString());
                    if (note) {
                        const noteWithType = {
                            ...note,
                            type: 'file',
                            isShared: true,
                            sharedBy: share.owner_id.toString(),
                            permission: userPermission,
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
                }
                catch (error) {
                    console.error(`Error fetching note ${share.resource_id}: ${error.message}`);
                }
            }
            else if (share.resource_type === 'folder') {
                try {
                    const folder = await this.noteFolderService.getFolderById(share.resource_id.toString());
                    if (folder) {
                        const folderWithSharedInfo = {
                            ...folder,
                            type: 'folder',
                            isShared: true,
                            sharedBy: share.owner_id.toString(),
                            permission: userPermission,
                            sharedWith: sharedWithDetails,
                            owner_info: {
                                id: ownerInfo?.user_id.toString(),
                                name: ownerInfo?.full_name,
                                email: ownerInfo?.email,
                                avatar_url: ownerInfo?.avatar_url,
                            },
                        };
                        this.applyPermissionToFolderContents(folderWithSharedInfo, userPermission, share.owner_id.toString(), ownerInfo);
                        rootItems.push(folderWithSharedInfo);
                    }
                }
                catch (error) {
                    console.error(`Error fetching folder ${share.resource_id}: ${error.message}`);
                }
            }
        }
        return rootItems;
    }
    async getSharesByOwnerId(ownerId) {
        const shares = await this.shareRepository.getSharesByOwnerId(ownerId);
        const sharedUserIds = new Set();
        for (const share of shares) {
            for (const sharedUser of share.shared_with) {
                sharedUserIds.add(sharedUser.user_id.toString());
            }
        }
        let sharedUserInfoMap = new Map();
        if (sharedUserIds.size > 0) {
            try {
                const sharedUserInfo = await this.userHttpClient.getUsersByIds(Array.from(sharedUserIds));
                sharedUserInfoMap = new Map(sharedUserInfo.map((user) => [user.user_id.toString(), user]));
            }
            catch (error) {
                console.error('Error fetching shared user information:', error.message);
            }
        }
        return shares.map((share) => {
            const shareResponse = new ShareResponse_dto_1.ShareResponse(share);
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
    async getSharedResourceDetail(resourceType, resourceId, userId) {
        const share = await this.shareRepository.findShareByResourceIdAndUserId(resourceType, resourceId, userId);
        if (!share) {
            return null;
        }
        const userPermission = share.shared_with.find((u) => u.user_id.toString() === userId)
            ?.permission || 'view';
        let ownerInfo = null;
        try {
            const ownerInfoArray = await this.userHttpClient.getUsersByIds([
                share.owner_id.toString(),
            ]);
            if (ownerInfoArray && ownerInfoArray.length > 0) {
                ownerInfo = ownerInfoArray[0];
            }
        }
        catch (error) {
            console.error(`Error fetching owner information: ${error.message}`);
        }
        const sharedUserIds = share.shared_with.map((user) => user.user_id.toString());
        let sharedUserInfoMap = new Map();
        if (sharedUserIds.length > 0) {
            try {
                const sharedUserInfo = await this.userHttpClient.getUsersByIds(sharedUserIds);
                sharedUserInfoMap = new Map(sharedUserInfo.map((user) => [user.user_id.toString(), user]));
            }
            catch (error) {
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
                    const noteWithType = {
                        ...note,
                        type: 'file',
                        isShared: true,
                        sharedBy: share.owner_id.toString(),
                        permission: userPermission,
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
            }
            catch (error) {
                console.error(`Error fetching note ${resourceId}: ${error.message}`);
            }
        }
        else if (resourceType === 'folder') {
            try {
                const folder = await this.noteFolderService.getFolderById(resourceId);
                if (folder) {
                    const folderWithSharedInfo = {
                        ...folder,
                        type: 'folder',
                        isShared: true,
                        sharedBy: share.owner_id.toString(),
                        permission: userPermission,
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
                    this.applyPermissionToFolderContents(folderWithSharedInfo, userPermission, share.owner_id.toString(), ownerInfo);
                    return folderWithSharedInfo;
                }
            }
            catch (error) {
                console.error(`Error fetching folder ${resourceId}: ${error.message}`);
            }
        }
        return null;
    }
    applyPermissionToFolderContents(folder, permission, ownerId, ownerInfo) {
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
                this.applyPermissionToFolderContents(subfolderWithPermission, permission, ownerId, ownerInfo);
                return subfolderWithPermission;
            });
        }
    }
    async validateResourceOwnership(resourceType, resourceId, ownerId) {
        if (resourceType === 'note') {
            const note = await this.noteService.getNotebyId(resourceId);
            if (!note) {
                throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.RESOURCE_NOT_FOUND);
            }
            if (note.user_id.toString() !== ownerId) {
                throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.PERMISSION_DENIED);
            }
        }
        else if (resourceType === 'folder') {
            const folder = await this.noteFolderService.getFolderById(resourceId);
            if (!folder) {
                throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.RESOURCE_NOT_FOUND);
            }
            if (folder.user_id.toString() !== ownerId) {
                throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.PERMISSION_DENIED);
            }
        }
        else {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.INVALID_RESOURCE_TYPE);
        }
    }
    async leaveSharedResource(resourceType, resourceId, userInfo) {
        try {
            let resource;
            if (resourceType === 'note') {
                resource = await this.noteRepository.getNoteByID(resourceId);
            }
            else if (resourceType === 'folder') {
                resource =
                    await this.noteFolderRepository.getNoteFolderById(resourceId);
            }
            if (!resource) {
                throw new common_1.NotFoundException(`${resourceType} not found`);
            }
            const shareDoc = await this.shareRepository.findShareByResourceId(resourceType, resourceId);
            if (!shareDoc) {
                throw new common_1.NotFoundException('Share document not found');
            }
            const userIndex = shareDoc.shared_with.findIndex((user) => user.user_id.toString() === userInfo.userId);
            if (userIndex === -1) {
                throw new common_1.BadRequestException('User is not in shared list');
            }
            shareDoc.shared_with.splice(userIndex, 1);
            if (shareDoc.shared_with.length === 0) {
                await this.shareRepository.deleteShare(shareDoc._id.toString());
            }
            else {
                await this.shareRepository.updateShare(shareDoc._id.toString(), shareDoc.shared_with.map((user) => ({
                    user_id: user.user_id.toString(),
                    permission: user.permission,
                })));
            }
            return new api_response_1.ApiResponse(null);
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to leave shared resource');
        }
    }
};
exports.ShareService = ShareService;
exports.ShareService = ShareService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [share_repository_1.ShareRepository,
        note_service_1.NoteService,
        note_folder_service_1.NoteFolderService,
        user_http_client_1.UserHttpClient,
        note_repository_1.NoteRepository,
        note_folder_repository_1.NoteFolderRepository,
        notification_http_client_1.NotificationHttpClient,
        note_gateway_1.NoteGateway])
], ShareService);
//# sourceMappingURL=share.service.js.map