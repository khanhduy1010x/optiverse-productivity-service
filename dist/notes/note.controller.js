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
exports.NoteController = void 0;
const common_1 = require("@nestjs/common");
const note_service_1 = require("./note.service");
const api_response_1 = require("../common/api-response");
const CreateNoteRequest_dto_1 = require("./dto/request/CreateNoteRequest.dto");
const UpdateNoteRequest_dto_1 = require("./dto/request/UpdateNoteRequest.dto");
const swagger_1 = require("@nestjs/swagger");
let NoteController = class NoteController {
    constructor(noteService) {
        this.noteService = noteService;
    }
    async getNotesByUserID(req) {
        const user = req.userInfo;
        const notes = await this.noteService.getNotesByUserId(user.userId);
        return new api_response_1.ApiResponse(notes);
    }
    async getNotesByFolderID(folderId) {
        const notes = await this.noteService.getNotesByFolderID(folderId);
        return new api_response_1.ApiResponse(notes);
    }
    async createNote(req, createNoteDto) {
        const user = req.userInfo;
        const note = await this.noteService.createNote(createNoteDto, user.userId);
        return new api_response_1.ApiResponse(note);
    }
    async updateNote(noteId, updateNoteDto) {
        const note = await this.noteService.updateNote(noteId, updateNoteDto);
        return new api_response_1.ApiResponse(note);
    }
    async deleteNote(noteId) {
        await this.noteService.deleteNote(noteId);
        return new api_response_1.ApiResponse();
    }
    async getNoteById(noteId) {
        const note = await this.noteService.getNotebyId(noteId);
        return new api_response_1.ApiResponse(note);
    }
};
exports.NoteController = NoteController;
__decorate([
    (0, common_1.Get)('root'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NoteController.prototype, "getNotesByUserID", null);
__decorate([
    (0, common_1.Get)('folder/:folderId'),
    __param(0, (0, common_1.Param)('folderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NoteController.prototype, "getNotesByFolderID", null);
__decorate([
    (0, swagger_1.ApiBody)({ type: CreateNoteRequest_dto_1.CreateNoteRequest }),
    (0, common_1.Post)(''),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateNoteRequest_dto_1.CreateNoteRequest]),
    __metadata("design:returntype", Promise)
], NoteController.prototype, "createNote", null);
__decorate([
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: String,
    }),
    (0, swagger_1.ApiBody)({ type: UpdateNoteRequest_dto_1.UpdateNoteRequest }),
    (0, common_1.Patch)('/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateNoteRequest_dto_1.UpdateNoteRequest]),
    __metadata("design:returntype", Promise)
], NoteController.prototype, "updateNote", null);
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
], NoteController.prototype, "deleteNote", null);
__decorate([
    (0, common_1.Get)('/:noteId'),
    __param(0, (0, common_1.Param)('noteId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NoteController.prototype, "getNoteById", null);
exports.NoteController = NoteController = __decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('/note'),
    __metadata("design:paramtypes", [note_service_1.NoteService])
], NoteController);
//# sourceMappingURL=note.controller.js.map