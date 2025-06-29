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
let ShareService = class ShareService {
    constructor(shareRepository, noteService, noteFolderService, userHttpClient) {
        this.shareRepository = shareRepository;
        this.noteService = noteService;
        this.noteFolderService = noteFolderService;
        this.userHttpClient = userHttpClient;
    }
    async shareResource(ownerId, resourceType, resourceId, users) {
        await this.validateResourceOwnership(resourceType, resourceId, ownerId);
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
            }
            else {
                share = existingShare;
            }
        }
        else {
            share = await this.shareRepository.createShare(ownerId, resourceType, resourceId, users);
        }
        return new ShareResponse_dto_1.ShareResponse(share);
    }
    async updateSharedUsers(ownerId, resourceType, resourceId, users) {
        await this.validateResourceOwnership(resourceType, resourceId, ownerId);
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
        const updatedShare = await this.shareRepository.updateShare(existingShare._id.toString(), users);
        if (!updatedShare) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.UPDATE_SHARE_FAILED);
        }
        return new ShareResponse_dto_1.ShareResponse(updatedShare);
    }
    async removeUserFromShare(ownerId, resourceType, resourceId, userId) {
        await this.validateResourceOwnership(resourceType, resourceId, ownerId);
        const existingShare = await this.shareRepository.findShareByResourceId(resourceType, resourceId);
        if (!existingShare) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.SHARE_NOT_FOUND);
        }
        const updatedShare = await this.shareRepository.removeUserFromShare(existingShare._id.toString(), userId);
        if (!updatedShare) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.UPDATE_SHARE_FAILED);
        }
        if (updatedShare.shared_with.length === 0) {
            await this.shareRepository.deleteShare(updatedShare._id.toString());
            return new ShareResponse_dto_1.ShareResponse({
                ...updatedShare,
                shared_with: [],
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
        const rootItems = [];
        for (const share of shares) {
            const userPermission = share.shared_with.find((u) => u.user_id.toString() === userId)
                ?.permission || 'view';
            const ownerIdStr = share.owner_id.toString();
            const ownerInfo = ownerInfoMap.get(ownerIdStr);
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
                            owner_info: {
                                id: ownerInfo?.user_id.toString(),
                                name: ownerInfo?.full_name,
                                email: ownerInfo?.email,
                                avatar_url: ownerInfo?.avatar_url,
                            },
                        };
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
        return shares.map((share) => new ShareResponse_dto_1.ShareResponse(share));
    }
    async getSharedResourceDetail(resourceType, resourceId, userId) {
        const share = await this.shareRepository.findShareByResourceIdAndUserId(resourceType, resourceId, userId);
        if (!share) {
            return null;
        }
        const userPermission = share.shared_with.find((u) => u.user_id.toString() === userId)
            ?.permission || 'view';
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
                        owner_info: {
                            id: share.owner_id.toString(),
                        },
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
                        owner_info: {
                            id: share.owner_id.toString(),
                        },
                    };
                    this.applyPermissionToFolderContents(folderWithSharedInfo, userPermission, share.owner_id.toString());
                    return folderWithSharedInfo;
                }
            }
            catch (error) {
                console.error(`Error fetching folder ${resourceId}: ${error.message}`);
            }
        }
        return null;
    }
    applyPermissionToFolderContents(folder, permission, ownerId) {
        if (folder.files && folder.files.length > 0) {
            folder.files = folder.files.map((file) => ({
                ...file,
                isShared: true,
                sharedBy: ownerId,
                permission: permission,
                owner_info: {
                    id: ownerId,
                    name: folder.owner_info?.name,
                    email: folder.owner_info?.email,
                    avatar_url: folder.owner_info?.avatar_url,
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
                        id: ownerId,
                        name: folder.owner_info?.name,
                        email: folder.owner_info?.email,
                        avatar_url: folder.owner_info?.avatar_url,
                    },
                    type: 'folder',
                };
                this.applyPermissionToFolderContents(subfolderWithPermission, permission, ownerId);
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
};
exports.ShareService = ShareService;
exports.ShareService = ShareService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [share_repository_1.ShareRepository,
        note_service_1.NoteService,
        note_folder_service_1.NoteFolderService,
        user_http_client_1.UserHttpClient])
], ShareService);
//# sourceMappingURL=share.service.js.map