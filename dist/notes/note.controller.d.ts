import { NoteService } from './note.service';
import { ApiResponse } from 'src/common/api-response';
import { NoteResponse } from './dto/response/NoteResponse.dto';
import { CreateNoteRequest } from './dto/request/CreateNoteRequest.dto';
import { UpdateNoteRequest } from './dto/request/UpdateNoteRequest.dto';
import { Note } from './note.schema';
export declare class NoteController {
    private readonly noteService;
    constructor(noteService: NoteService);
    getNotesByUserID(req: any): Promise<ApiResponse<Note[]>>;
    getNotesByFolderID(folderId: string): Promise<ApiResponse<Note[]>>;
    createNote(req: any, createNoteDto: CreateNoteRequest): Promise<ApiResponse<NoteResponse>>;
    updateNote(noteId: string, updateNoteDto: UpdateNoteRequest): Promise<ApiResponse<NoteResponse>>;
    deleteNote(noteId: string): Promise<ApiResponse<void>>;
}
