import { Model } from 'mongoose';
import { Note } from './note.schema';
import { CreateNoteRequest } from './dto/request/CreateNoteRequest.dto';
import { UpdateNoteRequest } from './dto/request/UpdateNoteRequest.dto';
export declare class NoteRepository {
    private readonly noteModel;
    constructor(noteModel: Model<Note>);
    getNotesByUserID(userId: string): Promise<Note[]>;
    getNotesByFolderID(folderId: string): Promise<Note[]>;
    createNote(createNoteDto: CreateNoteRequest, userId: string): Promise<Note>;
    updateNote(noteId: string, updateNoteDto: UpdateNoteRequest): Promise<Note>;
    deleteNote(noteId: string): Promise<void>;
    deleteManyByIds(ids: string[]): Promise<void>;
    getNoteInRootByUserID(userId: string): Promise<Note[]>;
    getNoteByID(id: string): Promise<Note>;
}
