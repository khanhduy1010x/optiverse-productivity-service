import { Model } from 'mongoose';
import { NoteFolder } from './note-folder.schema';
import { CreateNoteFolderRequest } from './dto/request/CreateNoteFolderRequest.dto';
import { UpdateNoteFolderRequest } from './dto/request/UpdateNoteFolderRequest.dto';
export declare class NoteFolderRepository {
    private readonly noteFolderModel;
    constructor(noteFolderModel: Model<NoteFolder>);
    getNoteFolderById(id: string): Promise<NoteFolder | null>;
    getAllSubfolders(parentFolderId: string): Promise<NoteFolder[]>;
    getNoteFoldersByUserID(userId: string): Promise<NoteFolder[]>;
    createNoteFolder(createNoteFolderDto: CreateNoteFolderRequest, userId: string): Promise<NoteFolder>;
    updateNoteFolder(noteFolderId: string, updateNoteFolderDto: UpdateNoteFolderRequest): Promise<NoteFolder>;
    deleteNoteFolder(noteFolderId: string): Promise<void>;
    deleteManyByIds(ids: string[]): Promise<void>;
}
