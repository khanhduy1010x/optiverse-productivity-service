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
exports.NoteRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const note_schema_1 = require("./note.schema");
const app_exception_1 = require("../common/exceptions/app.exception");
const error_code_enum_1 = require("../common/exceptions/error-code.enum");
let NoteRepository = class NoteRepository {
    constructor(noteModel) {
        this.noteModel = noteModel;
    }
    async getNotesByUserID(userId) {
        return await this.noteModel
            .find({
            user_id: new mongoose_2.Types.ObjectId(userId),
            $or: [{ folder_id: null }, { folder_id: { $exists: false } }],
        })
            .exec();
    }
    async getNotesByFolderID(folderId) {
        return await this.noteModel
            .find({ folder_id: new mongoose_2.Types.ObjectId(folderId) })
            .exec();
    }
    async createNote(createNoteDto, userId) {
        const newNote = new this.noteModel({
            ...createNoteDto,
            user_id: new mongoose_2.Types.ObjectId(userId),
            folder_id: createNoteDto.folder_id
                ? new mongoose_2.Types.ObjectId(createNoteDto.folder_id)
                : null,
        });
        return await newNote.save();
    }
    async updateNote(noteId, updateNoteDto) {
        const update = { ...updateNoteDto };
        if ('folder_id' in updateNoteDto) {
            const folder_id = updateNoteDto.folder_id;
            if (typeof folder_id === 'string') {
                update.folder_id = new mongoose_2.Types.ObjectId(folder_id);
            }
        }
        return await this.noteModel
            .findByIdAndUpdate(new mongoose_2.Types.ObjectId(noteId), update, { new: true })
            .orFail(new app_exception_1.AppException(error_code_enum_1.ErrorCode.NOT_FOUND));
    }
    async deleteNote(noteId) {
        const result = await this.noteModel.deleteOne({ _id: noteId }).exec();
        if (result.deletedCount === 0) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.NOT_FOUND);
        }
    }
    async deleteManyByIds(ids) {
        const objectIds = ids.map((id) => new mongoose_2.Types.ObjectId(id));
        const result = await this.noteModel.deleteMany({
            _id: { $in: objectIds },
        });
    }
    async getNoteInRootByUserID(userId) {
        return await this.noteModel
            .find({
            user_id: new mongoose_2.Types.ObjectId(userId),
            $or: [{ folder_id: null }, { folder_id: { $exists: false } }],
        })
            .lean()
            .exec();
    }
    async getNoteByID(id) {
        return await this.noteModel
            .findById(id)
            .lean()
            .orFail(new app_exception_1.AppException(error_code_enum_1.ErrorCode.NOT_FOUND));
    }
};
exports.NoteRepository = NoteRepository;
exports.NoteRepository = NoteRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(note_schema_1.Note.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], NoteRepository);
//# sourceMappingURL=note.repository.js.map