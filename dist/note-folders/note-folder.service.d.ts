import { NoteFolderRepository } from './note-folder.repository';
import { NoteFolder, NoteFolderTree, RootItem } from './note-folder.schema';
import { CreateNoteFolderRequest } from './dto/request/CreateNoteFolderRequest.dto';
import { UpdateNoteFolderRequest } from './dto/request/UpdateNoteFolderRequest.dto';
import { NoteFolderResponse } from './dto/response/NoteFolderResponse.dto';
import { NoteRepository } from '../notes/note.repository';
import { NoteService } from '../notes/note.service';
import { ShareRepository } from '../shares/share.repository';
import { UserHttpClient } from '../http-axios/user-http.client';
export declare class NoteFolderService {
    private readonly noteFolderRepository;
    private readonly noteService;
    private readonly noteRepository;
    private readonly shareRepository;
    private readonly userHttpClient;
    constructor(noteFolderRepository: NoteFolderRepository, noteService: NoteService, noteRepository: NoteRepository, shareRepository: ShareRepository, userHttpClient: UserHttpClient);
    getFolderById(folderId: string): Promise<NoteFolderTree | null>;
    buildFolderTree(flatList: NoteFolder[]): NoteFolderTree | null;
    getNoteFoldersByUserID(userId: string): Promise<NoteFolder[]>;
    createNoteFolder(createNoteFolderDto: CreateNoteFolderRequest, userId: string): Promise<NoteFolderResponse>;
    updateNoteFolder(noteFolderId: string, updateNoteFolderDto: UpdateNoteFolderRequest): Promise<NoteFolderResponse>;
    deleteNoteFolder(folderId: string): Promise<void>;
    retrieveAllFolderInRoot(user_id: string): Promise<NoteFolderTree[] | null>;
    retrieveAllFolderInRootforWeb(user_id: string): Promise<RootItem[]>;
    private buildFolderTreesForWeb;
    enrichItemsWithShareInfo(items: RootItem[]): Promise<void>;
    getShareInfoForFolder(folderId: string): Promise<import("../shares/share.schema").Share | null>;
}
