import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Request,
  Put,
  Req,
} from '@nestjs/common';
import { ShareService } from './share.service';
import { ApiResponse } from '../common/api-response';
import { ShareResourceRequest } from './dto/request/ShareRequest.dto';
import { ShareResponse } from './dto/response/ShareResponse.dto';
import { UserDto } from '../user-dto/user.dto';
import { RootItem } from '../note-folders/note-folder.schema';

@Controller('/shares')
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  @Post('/note/:id')
  async shareNote(
    @Request() req,
    @Param('id') noteId: string,
    @Body() shareDto: ShareResourceRequest,
  ): Promise<ApiResponse<ShareResponse>> {
    const user = req.userInfo as UserDto;
    const result = await this.shareService.shareResource(
      user.userId,
      'note',
      noteId,
      shareDto.users,
    );
    return new ApiResponse<ShareResponse>(result);
  }

  @Post('/folder/:id')
  async shareFolder(
    @Request() req,
    @Param('id') folderId: string,
    @Body() shareDto: ShareResourceRequest,
  ): Promise<ApiResponse<ShareResponse>> {
    const user = req.userInfo as UserDto;
    const result = await this.shareService.shareResource(
      user.userId,
      'folder',
      folderId,
      shareDto.users,
    );
    return new ApiResponse<ShareResponse>(result);
  }

  @Put('/note/:id')
  async updateNoteSharing(
    @Request() req,
    @Param('id') noteId: string,
    @Body() shareDto: ShareResourceRequest,
  ): Promise<ApiResponse<ShareResponse>> {
    const user = req.userInfo as UserDto;
    const result = await this.shareService.updateSharedUsers(
      user.userId,
      'note',
      noteId,
      shareDto.users,
    );
    return new ApiResponse<ShareResponse>(result);
  }

  @Put('/folder/:id')
  async updateFolderSharing(
    @Request() req,
    @Param('id') folderId: string,
    @Body() shareDto: ShareResourceRequest,
  ): Promise<ApiResponse<ShareResponse>> {
    const user = req.userInfo as UserDto;
    const result = await this.shareService.updateSharedUsers(
      user.userId,
      'folder',
      folderId,
      shareDto.users,
    );
    return new ApiResponse<ShareResponse>(result);
  }

  @Delete('/note/:id/user/:userId')
  async removeUserFromNoteShare(
    @Request() req,
    @Param('id') noteId: string,
    @Param('userId') userId: string,
  ): Promise<ApiResponse<ShareResponse>> {
    const user = req.userInfo as UserDto;
    const result = await this.shareService.removeUserFromShare(
      user.userId,
      'note',
      noteId,
      userId,
    );
    return new ApiResponse<ShareResponse>(result);
  }

  @Delete('/folder/:id/user/:userId')
  async removeUserFromFolderShare(
    @Request() req,
    @Param('id') folderId: string,
    @Param('userId') userId: string,
  ): Promise<ApiResponse<ShareResponse>> {
    const user = req.userInfo as UserDto;
    const result = await this.shareService.removeUserFromShare(
      user.userId,
      'folder',
      folderId,
      userId,
    );
    return new ApiResponse<ShareResponse>(result);
  }

  @Get('/shared-with-me')
  async getSharedWithMe(@Request() req): Promise<ApiResponse<RootItem[]>> {
    console.log('userId: ', req.userInfo);
    const user = req.userInfo as UserDto;
    const sharedItems =
      await this.shareService.getSharesSharedWithUserAsRootItems(user.userId);
    return new ApiResponse<RootItem[]>(sharedItems);
  }

  @Get('/my-shared')
  async getMySharedItems(
    @Request() req,
  ): Promise<ApiResponse<ShareResponse[]>> {
    const user = req.userInfo as UserDto;
    const sharedItems = await this.shareService.getSharesByOwnerId(user.userId);
    console.log(
      'My shared items with user details:',
      sharedItems.map((item) => ({
        id: item.id,
        resource_type: item.resource_type,
        resource_id: item.resource_id,
        shared_with: item.shared_with.map((user) => ({
          user_id: user.user_id,
          permission: user.permission,
          user_info: user.user_info,
        })),
      })),
    );
    return new ApiResponse<ShareResponse[]>(sharedItems);
  }

  @Get('/shared-resource/:type/:id')
  async getSharedResourceDetail(
    @Request() req,
    @Param('type') resourceType: string,
    @Param('id') resourceId: string,
  ): Promise<ApiResponse<RootItem | null>> {
    const user = req.userInfo as UserDto;
    const sharedResource = await this.shareService.getSharedResourceDetail(
      resourceType,
      resourceId,
      user.userId,
    );
    return new ApiResponse<RootItem | null>(sharedResource);
  }

  @Post(':resourceType/:resourceId/share')
  async shareResource(
    @Param('resourceType') resourceType: string,
    @Param('resourceId') resourceId: string,
    @Body() shareDto: ShareResourceRequest,
    @Req() req: any,
  ) {
    const user = req.userInfo as UserDto;
    const result = await this.shareService.shareResource(
      user.userId,
      resourceType,
      resourceId,
      shareDto.users,
    );
    return new ApiResponse<ShareResponse>(result);
  }

  @Delete(':resourceType/:resourceId/leave')
  async leaveSharedResource(
    @Param('resourceType') resourceType: string,
    @Param('resourceId') resourceId: string,
    @Req() req: any,
  ) {
    return this.shareService.leaveSharedResource(
      resourceType,
      resourceId,
      req.userInfo,
    );
  }
}
