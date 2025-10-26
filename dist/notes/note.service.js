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
exports.NoteService = void 0;
const common_1 = require("@nestjs/common");
const note_repository_1 = require("./note.repository");
const NoteResponse_dto_1 = require("./dto/response/NoteResponse.dto");
const share_repository_1 = require("../shares/share.repository");
let NoteService = class NoteService {
    constructor(noteRepository, shareRepository) {
        this.noteRepository = noteRepository;
        this.shareRepository = shareRepository;
    }
    async getNotesByUserId(userId) {
        return await this.noteRepository.getNotesByUserID(userId);
    }
    async getNotesByFolderID(folderId) {
        return await this.noteRepository.getNotesByFolderID(folderId);
    }
    async createNote(createNoteDto, userId) {
        const note = await this.noteRepository.createNote(createNoteDto, userId);
        return new NoteResponse_dto_1.NoteResponse(note);
    }
    async updateNote(noteId, updateNoteDto) {
        const note = await this.noteRepository.updateNote(noteId, updateNoteDto);
        return new NoteResponse_dto_1.NoteResponse(note);
    }
    async deleteNote(noteId) {
        return await this.noteRepository.deleteNote(noteId);
    }
    async deleteManyByIds(ids) {
        return await this.noteRepository.deleteManyByIds(ids);
    }
    async getNotebyId(id) {
        return await this.noteRepository.getNoteByID(id);
    }
    async getShareInfoForNote(noteId) {
        return await this.shareRepository.findShareByResourceId('note', noteId);
    }
    async getFolderShareInfo(folderId) {
        return await this.shareRepository.findShareByResourceId('folder', folderId);
    }
};
exports.NoteService = NoteService;
exports.NoteService = NoteService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [note_repository_1.NoteRepository,
        share_repository_1.ShareRepository])
], NoteService);
//# sourceMappingURL=note.service.js.map