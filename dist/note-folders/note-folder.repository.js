"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoteFolderRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = __importStar(require("mongoose"));
const note_folder_schema_1 = require("./note-folder.schema");
const app_exception_1 = require("../common/exceptions/app.exception");
const error_code_enum_1 = require("../common/exceptions/error-code.enum");
let NoteFolderRepository = class NoteFolderRepository {
    constructor(noteFolderModel) {
        this.noteFolderModel = noteFolderModel;
    }
    async getNoteFolderById(id) {
        return await this.noteFolderModel.findById(id).populate('files').lean();
    }
    async getAllSubfolders(parentFolderId) {
        const allSubfolders = [];
        const queue = [parentFolderId];
        while (queue.length > 0) {
            const currentParentId = queue.shift();
            const subfolders = await this.noteFolderModel
                .find({
                parent_folder_id: new mongoose_2.default.Types.ObjectId(currentParentId),
            })
                .populate('files')
                .lean();
            if (subfolders) {
                allSubfolders.push(...subfolders);
                queue.push(...subfolders.map((folder) => folder._id.toString()));
            }
        }
        return allSubfolders;
    }
    async getNoteFoldersByUserID(userId) {
        return await this.noteFolderModel
            .find({
            user_id: new mongoose_2.Types.ObjectId(userId),
            $or: [{ parent_folder_id: null }, { parent_folder_id: { $exists: false } }],
        })
            .populate('files')
            .lean();
    }
    async createNoteFolder(createNoteFolderDto, userId) {
        const newNoteFolder = new this.noteFolderModel({
            ...createNoteFolderDto,
            user_id: new mongoose_2.Types.ObjectId(userId),
            parent_folder_id: createNoteFolderDto.parent_folder_id
                ? new mongoose_2.Types.ObjectId(createNoteFolderDto.parent_folder_id)
                : null,
        });
        return await newNoteFolder.save();
    }
    async updateNoteFolder(noteFolderId, updateNoteFolderDto) {
        const update = { ...updateNoteFolderDto };
        if ('parent_folder_id' in updateNoteFolderDto) {
            const parent_folder_id = updateNoteFolderDto.parent_folder_id;
            if (typeof parent_folder_id === 'string') {
                update.parent_folder_id = new mongoose_2.Types.ObjectId(parent_folder_id);
            }
        }
        return await this.noteFolderModel
            .findByIdAndUpdate(noteFolderId, update, { new: true })
            .orFail(new app_exception_1.AppException(error_code_enum_1.ErrorCode.NOT_FOUND));
    }
    async deleteNoteFolder(noteFolderId) {
        const result = await this.noteFolderModel.deleteOne({ _id: noteFolderId }).exec();
        if (result.deletedCount === 0) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.NOT_FOUND);
        }
    }
    async deleteManyByIds(ids) {
        const objectIds = ids.map((id) => new mongoose_2.Types.ObjectId(id));
        const result = await this.noteFolderModel.deleteMany({
            _id: { $in: objectIds },
        });
    }
};
exports.NoteFolderRepository = NoteFolderRepository;
exports.NoteFolderRepository = NoteFolderRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(note_folder_schema_1.NoteFolder.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], NoteFolderRepository);
//# sourceMappingURL=note-folder.repository.js.map