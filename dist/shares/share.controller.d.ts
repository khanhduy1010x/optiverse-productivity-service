import { ShareService } from './share.service';
import { ApiResponse } from '../common/api-response';
import { ShareResourceRequest } from './dto/request/ShareRequest.dto';
import { ShareResponse } from './dto/response/ShareResponse.dto';
import { RootItem } from '../note-folders/note-folder.schema';
export declare class ShareController {
    private readonly shareService;
    constructor(shareService: ShareService);
    shareNote(req: any, noteId: string, shareDto: ShareResourceRequest): Promise<ApiResponse<ShareResponse>>;
    shareFolder(req: any, folderId: string, shareDto: ShareResourceRequest): Promise<ApiResponse<ShareResponse>>;
    updateNoteSharing(req: any, noteId: string, shareDto: ShareResourceRequest): Promise<ApiResponse<ShareResponse>>;
    updateFolderSharing(req: any, folderId: string, shareDto: ShareResourceRequest): Promise<ApiResponse<ShareResponse>>;
    removeUserFromNoteShare(req: any, noteId: string, userId: string): Promise<ApiResponse<ShareResponse>>;
    removeUserFromFolderShare(req: any, folderId: string, userId: string): Promise<ApiResponse<ShareResponse>>;
    getSharedWithMe(req: any): Promise<ApiResponse<RootItem[]>>;
    getMySharedItems(req: any): Promise<ApiResponse<ShareResponse[]>>;
    getSharedResourceDetail(req: any, resourceType: string, resourceId: string): Promise<ApiResponse<RootItem | null>>;
}
