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
exports.NoteFolderService = void 0;
const common_1 = require("@nestjs/common");
const note_folder_repository_1 = require("./note-folder.repository");
const NoteFolderResponse_dto_1 = require("./dto/response/NoteFolderResponse.dto");
const note_repository_1 = require("../notes/note.repository");
const note_service_1 = require("../notes/note.service");
let NoteFolderService = class NoteFolderService {
    constructor(noteFolderRepository, noteService, noteRepository) {
        this.noteFolderRepository = noteFolderRepository;
        this.noteService = noteService;
        this.noteRepository = noteRepository;
    }
    async getFolderById(folderId) {
        const folder = await this.noteFolderRepository.getNoteFolderById(folderId);
        if (folder === null) {
            return folder;
        }
        const allSubfolders = await this.noteFolderRepository.getAllSubfolders(folderId);
        const responseFolder = this.buildFolderTree([folder, ...allSubfolders]);
        return responseFolder;
    }
    buildFolderTree(flatList) {
        const folderMap = new Map();
        let root = null;
        flatList.forEach((folder) => {
            const folderTree = { ...folder, subfolders: [] };
            folderMap.set(folder._id.toString(), folderTree);
        });
        flatList.forEach((folder) => {
            if (!folder.parent_folder_id) {
                if (!root) {
                    root = folderMap.get(folder._id.toString());
                }
                return;
            }
            const parent = folderMap.get(folder.parent_folder_id.toString());
            if (parent) {
                parent.subfolders.push(folderMap.get(folder._id.toString()));
            }
        });
        return root;
    }
    async getNoteFoldersByUserID(userId) {
        return await this.noteFolderRepository.getNoteFoldersByUserID(userId);
    }
    async createNoteFolder(createNoteFolderDto, userId) {
        const noteFolder = await this.noteFolderRepository.createNoteFolder(createNoteFolderDto, userId);
        return new NoteFolderResponse_dto_1.NoteFolderResponse(noteFolder);
    }
    async updateNoteFolder(noteFolderId, updateNoteFolderDto) {
        const noteFolder = await this.noteFolderRepository.updateNoteFolder(noteFolderId, updateNoteFolderDto);
        return new NoteFolderResponse_dto_1.NoteFolderResponse(noteFolder);
    }
    async deleteNoteFolder(folderId) {
        const folder = await this.noteFolderRepository.getNoteFolderById(folderId);
        if (folder === null) {
            return;
        }
        const allSubfolders = await this.noteFolderRepository.getAllSubfolders(folderId);
        const folderIds = [folderId, ...allSubfolders.map((folder) => folder._id.toString())];
        let fileIds = allSubfolders.flatMap((folder) => {
            const files = folder['files']?.map((file) => file._id.toString());
            return files;
        });
        const currentFileIdsInThisFolder = folder['files']?.map((file) => file._id.toString());
        fileIds = [...currentFileIdsInThisFolder, ...fileIds];
        await this.noteService.deleteManyByIds(fileIds);
        await this.noteFolderRepository.deleteManyByIds(folderIds);
    }
    async retrieveAllFolderInRoot(user_id) {
        const allFolders = await this.noteFolderRepository.getNoteFoldersByUserID(user_id);
        if (!allFolders || allFolders.length === 0)
            return null;
        const folderTrees = [];
        for (const root of allFolders) {
            const allSubfolders = await this.noteFolderRepository.getAllSubfolders(root._id.toString());
            const tree = this.buildFolderTree([root, ...allSubfolders]);
            if (tree) {
                folderTrees.push(tree);
            }
        }
        return folderTrees;
    }
    async retrieveAllFolderInRootforWeb(user_id) {
        const allFolders = await this.noteFolderRepository.getNoteFoldersByUserID(user_id);
        const allSubfolders = [];
        if (allFolders && allFolders.length > 0) {
            for (const root of allFolders) {
                const subfolders = await this.noteFolderRepository.getAllSubfolders(root._id.toString());
                allSubfolders.push(...subfolders);
            }
        }
        const rootNotes = await this.noteRepository.getNoteInRootByUserID(user_id);
        const result = [];
        const folderTrees = this.buildFolderTreesForWeb([...allFolders, ...allSubfolders]);
        result.push(...folderTrees);
        if (rootNotes && rootNotes.length > 0) {
            const notesWithType = rootNotes.map((note) => ({
                ...note,
                type: 'file',
            }));
            result.push(...notesWithType);
        }
        return result.length > 0 ? result : [];
    }
    buildFolderTreesForWeb(flatList) {
        const folderMap = new Map();
        const roots = [];
        flatList.forEach((folder) => {
            const folderTree = {
                ...folder,
                subfolders: [],
                type: 'folder',
            };
            folderMap.set(folder._id.toString(), folderTree);
            if (!folder.parent_folder_id) {
                roots.push(folderTree);
            }
        });
        flatList.forEach((folder) => {
            if (folder.parent_folder_id) {
                const parent = folderMap.get(folder.parent_folder_id.toString());
                if (parent) {
                    parent.subfolders.push(folderMap.get(folder._id.toString()));
                }
            }
        });
        return roots;
    }
};
exports.NoteFolderService = NoteFolderService;
exports.NoteFolderService = NoteFolderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [note_folder_repository_1.NoteFolderRepository,
        note_service_1.NoteService,
        note_repository_1.NoteRepository])
], NoteFolderService);
//# sourceMappingURL=note-folder.service.js.map