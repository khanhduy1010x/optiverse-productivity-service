import { ShareRepository } from './share.repository';
import { NoteService } from '../notes/note.service';
import { NoteFolderService } from '../note-folders/note-folder.service';
import { ShareResponse } from './dto/response/ShareResponse.dto';
import { ShareUserDto } from './dto/request/ShareRequest.dto';
import { RootItem } from '../note-folders/note-folder.schema';
import { UserHttpClient } from 'src/http-axios/user-http.client';
export declare class ShareService {
    private readonly shareRepository;
    private readonly noteService;
    private readonly noteFolderService;
    private readonly userHttpClient;
    constructor(shareRepository: ShareRepository, noteService: NoteService, noteFolderService: NoteFolderService, userHttpClient: UserHttpClient);
    shareResource(ownerId: string, resourceType: string, resourceId: string, users: ShareUserDto[]): Promise<ShareResponse>;
    updateSharedUsers(ownerId: string, resourceType: string, resourceId: string, users: ShareUserDto[]): Promise<ShareResponse>;
    removeUserFromShare(ownerId: string, resourceType: string, resourceId: string, userId: string): Promise<ShareResponse>;
    getSharesSharedWithUser(userId: string): Promise<ShareResponse[]>;
    getSharesSharedWithUserAsRootItems(userId: string): Promise<RootItem[]>;
    getSharesByOwnerId(ownerId: string): Promise<ShareResponse[]>;
    getSharedResourceDetail(resourceType: string, resourceId: string, userId: string): Promise<RootItem | null>;
    private applyPermissionToFolderContents;
    private validateResourceOwnership;
}
