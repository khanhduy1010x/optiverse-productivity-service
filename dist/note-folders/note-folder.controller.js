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
exports.NoteFolderController = void 0;
const common_1 = require("@nestjs/common");
const note_folder_service_1 = require("./note-folder.service");
const api_response_1 = require("../common/api-response");
const CreateNoteFolderRequest_dto_1 = require("./dto/request/CreateNoteFolderRequest.dto");
const UpdateNoteFolderRequest_dto_1 = require("./dto/request/UpdateNoteFolderRequest.dto");
const swagger_1 = require("@nestjs/swagger");
let NoteFolderController = class NoteFolderController {
    constructor(noteFolderService) {
        this.noteFolderService = noteFolderService;
    }
    async getNoteFoldersByUserID(req) {
        const user = req.userInfo;
        const noteFolders = await this.noteFolderService.getNoteFoldersByUserID(user.userId);
        return new api_response_1.ApiResponse(noteFolders);
    }
    async getNoteFolderById(folderId) {
        const noteFolder = await this.noteFolderService.getFolderById(folderId);
        return new api_response_1.ApiResponse(noteFolder);
    }
    async createNoteFolder(req, createNoteFolderDto) {
        const user = req.userInfo;
        const noteFolder = await this.noteFolderService.createNoteFolder(createNoteFolderDto, user.userId);
        return new api_response_1.ApiResponse(noteFolder);
    }
    async updateNoteFolder(noteFolderId, updateNoteFolderDto) {
        const noteFolder = await this.noteFolderService.updateNoteFolder(noteFolderId, updateNoteFolderDto);
        return new api_response_1.ApiResponse(noteFolder);
    }
    async deleteNoteFolder(noteFolderId) {
        const result = await this.noteFolderService.deleteNoteFolder(noteFolderId);
        return new api_response_1.ApiResponse(null);
    }
    async retriveAllRootFolder(req) {
        const user = req.userInfo;
        const noteFolders = await this.noteFolderService.retrieveAllFolderInRoot(user.userId);
        return new api_response_1.ApiResponse(noteFolders);
    }
    async retriveAllRootFolderForWeb(req) {
        const user = req.userInfo;
        const noteFolders = await this.noteFolderService.retrieveAllFolderInRootforWeb(user.userId);
        return new api_response_1.ApiResponse(noteFolders);
    }
};
exports.NoteFolderController = NoteFolderController;
__decorate([
    (0, common_1.Get)('root'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NoteFolderController.prototype, "getNoteFoldersByUserID", null);
__decorate([
    (0, common_1.Get)('/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NoteFolderController.prototype, "getNoteFolderById", null);
__decorate([
    (0, swagger_1.ApiBody)({ type: CreateNoteFolderRequest_dto_1.CreateNoteFolderRequest }),
    (0, common_1.Post)(''),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateNoteFolderRequest_dto_1.CreateNoteFolderRequest]),
    __metadata("design:returntype", Promise)
], NoteFolderController.prototype, "createNoteFolder", null);
__decorate([
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: String,
    }),
    (0, swagger_1.ApiBody)({ type: UpdateNoteFolderRequest_dto_1.UpdateNoteFolderRequest }),
    (0, common_1.Patch)('/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateNoteFolderRequest_dto_1.UpdateNoteFolderRequest]),
    __metadata("design:returntype", Promise)
], NoteFolderController.prototype, "updateNoteFolder", null);
__decorate([
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: String,
    }),
    (0, common_1.Delete)('/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NoteFolderController.prototype, "deleteNoteFolder", null);
__decorate([
    (0, common_1.Get)('/root/retrive'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NoteFolderController.prototype, "retriveAllRootFolder", null);
__decorate([
    (0, common_1.Get)('/root/retrive-web'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NoteFolderController.prototype, "retriveAllRootFolderForWeb", null);
exports.NoteFolderController = NoteFolderController = __decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('/note-folder'),
    __metadata("design:paramtypes", [note_folder_service_1.NoteFolderService])
], NoteFolderController);
//# sourceMappingURL=note-folder.controller.js.map