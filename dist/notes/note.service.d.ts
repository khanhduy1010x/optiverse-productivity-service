import { NoteRepository } from './note.repository';
import { Note } from './note.schema';
import { CreateNoteRequest } from './dto/request/CreateNoteRequest.dto';
import { UpdateNoteRequest } from './dto/request/UpdateNoteRequest.dto';
import { NoteResponse } from './dto/response/NoteResponse.dto';
export declare class NoteService {
    private readonly noteRepository;
    constructor(noteRepository: NoteRepository);
    getNotesByUserId(userId: string): Promise<Note[]>;
    getNotesByFolderID(folderId: string): Promise<Note[]>;
    createNote(createNoteDto: CreateNoteRequest, userId: string): Promise<NoteResponse>;
    updateNote(noteId: string, updateNoteDto: UpdateNoteRequest): Promise<NoteResponse>;
    deleteNote(noteId: string): Promise<void>;
    deleteManyByIds(ids: string[]): Promise<void>;
    getNotebyId(id: string): Promise<Note>;
}
