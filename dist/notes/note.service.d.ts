import { NoteRepository } from './note.repository';
import { Note } from './note.schema';
import { CreateNoteRequest } from './dto/request/CreateNoteRequest.dto';
import { UpdateNoteRequest } from './dto/request/UpdateNoteRequest.dto';
import { NoteResponse } from './dto/response/NoteResponse.dto';
import { ShareRepository } from '../shares/share.repository';
export declare class NoteService {
    private readonly noteRepository;
    private readonly shareRepository;
    constructor(noteRepository: NoteRepository, shareRepository: ShareRepository);
    getNotesByUserId(userId: string): Promise<Note[]>;
    getNotesByFolderID(folderId: string): Promise<Note[]>;
    createNote(createNoteDto: CreateNoteRequest, userId: string): Promise<NoteResponse>;
    updateNote(noteId: string, updateNoteDto: UpdateNoteRequest): Promise<NoteResponse>;
    deleteNote(noteId: string): Promise<void>;
    deleteManyByIds(ids: string[]): Promise<void>;
    getNotebyId(id: string): Promise<Note>;
    getShareInfoForNote(noteId: string): Promise<import("../shares/share.schema").Share | null>;
    getFolderShareInfo(folderId: string): Promise<import("../shares/share.schema").Share | null>;
}
