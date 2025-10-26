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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShareController = void 0;
const common_1 = require("@nestjs/common");
const share_service_1 = require("./share.service");
const api_response_1 = require("../common/api-response");
const ShareRequest_dto_1 = require("./dto/request/ShareRequest.dto");
let ShareController = class ShareController {
    constructor(shareService) {
        this.shareService = shareService;
    }
    async shareNote(req, noteId, shareDto) {
        const user = req.userInfo;
        const result = await this.shareService.shareResource(user.userId, 'note', noteId, shareDto.users);
        return new api_response_1.ApiResponse(result);
    }
    async shareFolder(req, folderId, shareDto) {
        const user = req.userInfo;
        const result = await this.shareService.shareResource(user.userId, 'folder', folderId, shareDto.users);
        return new api_response_1.ApiResponse(result);
    }
    async updateNoteSharing(req, noteId, shareDto) {
        const user = req.userInfo;
        const result = await this.shareService.updateSharedUsers(user.userId, 'note', noteId, shareDto.users);
        return new api_response_1.ApiResponse(result);
    }
    async updateFolderSharing(req, folderId, shareDto) {
        const user = req.userInfo;
        const result = await this.shareService.updateSharedUsers(user.userId, 'folder', folderId, shareDto.users);
        return new api_response_1.ApiResponse(result);
    }
    async removeUserFromNoteShare(req, noteId, userId) {
        const user = req.userInfo;
        const result = await this.shareService.removeUserFromShare(user.userId, 'note', noteId, userId);
        return new api_response_1.ApiResponse(result);
    }
    async removeUserFromFolderShare(req, folderId, userId) {
        const user = req.userInfo;
        const result = await this.shareService.removeUserFromShare(user.userId, 'folder', folderId, userId);
        return new api_response_1.ApiResponse(result);
    }
    async getSharedWithMe(req) {
        console.log('userId: ', req.userInfo);
        const user = req.userInfo;
        const sharedItems = await this.shareService.getSharesSharedWithUserAsRootItems(user.userId);
        return new api_response_1.ApiResponse(sharedItems);
    }
    async getMySharedItems(req) {
        const user = req.userInfo;
        const sharedItems = await this.shareService.getSharesByOwnerId(user.userId);
        console.log('My shared items with user details:', sharedItems.map((item) => ({
            id: item.id,
            resource_type: item.resource_type,
            resource_id: item.resource_id,
            shared_with: item.shared_with.map((user) => ({
                user_id: user.user_id,
                permission: user.permission,
                user_info: user.user_info,
            })),
        })));
        return new api_response_1.ApiResponse(sharedItems);
    }
    async getSharedResourceDetail(req, resourceType, resourceId) {
        const user = req.userInfo;
        const sharedResource = await this.shareService.getSharedResourceDetail(resourceType, resourceId, user.userId);
        return new api_response_1.ApiResponse(sharedResource);
    }
    async shareResource(resourceType, resourceId, shareDto, req) {
        const user = req.userInfo;
        const result = await this.shareService.shareResource(user.userId, resourceType, resourceId, shareDto.users);
        return new api_response_1.ApiResponse(result);
    }
    async leaveSharedResource(resourceType, resourceId, req) {
        return this.shareService.leaveSharedResource(resourceType, resourceId, req.userInfo);
    }
    async leaveNoteShare(req, noteId) {
        const user = req.userInfo;
        return this.shareService.leaveSharedResource('note', noteId, user);
    }
    async leaveFolderShare(req, folderId) {
        const user = req.userInfo;
        return this.shareService.leaveSharedResource('folder', folderId, user);
    }
};
exports.ShareController = ShareController;
__decorate([
    (0, common_1.Post)('/note/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, ShareRequest_dto_1.ShareResourceRequest]),
    __metadata("design:returntype", Promise)
], ShareController.prototype, "shareNote", null);
__decorate([
    (0, common_1.Post)('/folder/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, ShareRequest_dto_1.ShareResourceRequest]),
    __metadata("design:returntype", Promise)
], ShareController.prototype, "shareFolder", null);
__decorate([
    (0, common_1.Put)('/note/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, ShareRequest_dto_1.ShareResourceRequest]),
    __metadata("design:returntype", Promise)
], ShareController.prototype, "updateNoteSharing", null);
__decorate([
    (0, common_1.Put)('/folder/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, ShareRequest_dto_1.ShareResourceRequest]),
    __metadata("design:returntype", Promise)
], ShareController.prototype, "updateFolderSharing", null);
__decorate([
    (0, common_1.Delete)('/note/:id/user/:userId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ShareController.prototype, "removeUserFromNoteShare", null);
__decorate([
    (0, common_1.Delete)('/folder/:id/user/:userId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ShareController.prototype, "removeUserFromFolderShare", null);
__decorate([
    (0, common_1.Get)('/shared-with-me'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ShareController.prototype, "getSharedWithMe", null);
__decorate([
    (0, common_1.Get)('/my-shared'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ShareController.prototype, "getMySharedItems", null);
__decorate([
    (0, common_1.Get)('/shared-resource/:type/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('type')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ShareController.prototype, "getSharedResourceDetail", null);
__decorate([
    (0, common_1.Post)(':resourceType/:resourceId/share'),
    __param(0, (0, common_1.Param)('resourceType')),
    __param(1, (0, common_1.Param)('resourceId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, ShareRequest_dto_1.ShareResourceRequest, Object]),
    __metadata("design:returntype", Promise)
], ShareController.prototype, "shareResource", null);
__decorate([
    (0, common_1.Delete)(':resourceType/:resourceId/leave'),
    __param(0, (0, common_1.Param)('resourceType')),
    __param(1, (0, common_1.Param)('resourceId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ShareController.prototype, "leaveSharedResource", null);
__decorate([
    (0, common_1.Delete)('/note/:id/leave'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ShareController.prototype, "leaveNoteShare", null);
__decorate([
    (0, common_1.Delete)('/folder/:id/leave'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ShareController.prototype, "leaveFolderShare", null);
exports.ShareController = ShareController = __decorate([
    (0, common_1.Controller)('/shares'),
    __metadata("design:paramtypes", [share_service_1.ShareService])
], ShareController);
//# sourceMappingURL=share.controller.js.map