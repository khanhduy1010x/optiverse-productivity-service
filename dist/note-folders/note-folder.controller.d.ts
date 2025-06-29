import { NoteFolderService } from './note-folder.service';
import { ApiResponse } from 'src/common/api-response';
import { NoteFolderResponse } from './dto/response/NoteFolderResponse.dto';
import { CreateNoteFolderRequest } from './dto/request/CreateNoteFolderRequest.dto';
import { UpdateNoteFolderRequest } from './dto/request/UpdateNoteFolderRequest.dto';
import { NoteFolder, RootItem } from './note-folder.schema';
export declare class NoteFolderController {
    private readonly noteFolderService;
    constructor(noteFolderService: NoteFolderService);
    getNoteFoldersByUserID(req: any): Promise<ApiResponse<NoteFolder[]>>;
    getNoteFolderById(folderId: string): Promise<ApiResponse<NoteFolder>>;
    createNoteFolder(req: any, createNoteFolderDto: CreateNoteFolderRequest): Promise<ApiResponse<NoteFolderResponse>>;
    updateNoteFolder(noteFolderId: string, updateNoteFolderDto: UpdateNoteFolderRequest): Promise<ApiResponse<NoteFolderResponse>>;
    deleteNoteFolder(noteFolderId: string): Promise<ApiResponse<void>>;
    retriveAllRootFolder(req: any): Promise<ApiResponse<NoteFolder[]>>;
    retriveAllRootFolderForWeb(req: any): Promise<ApiResponse<RootItem[]>>;
}
