import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  Query,
  Logger,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WorkspaceFolderService } from './workspace-folder.service';
import { ApiResponse } from '../../common/api-response';

@ApiTags('Workspace Folders')
@Controller('workspace/:workspaceId/folders')
@ApiBearerAuth()
export class WorkspaceFolderController {
  private readonly logger = new Logger(WorkspaceFolderController.name);

  constructor(
    private readonly workspaceFolderService: WorkspaceFolderService,
  ) {}

  /**
   * Create new folder in workspace
   * Only NOTE_ADMIN can create
   */
  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Create new folder (NOTE_ADMIN only)',
    description:
      'Only users with NOTE_ADMIN permission can create folders. parent_folder_id is optional.',
  })
  async createFolder(
    @Param('workspaceId') workspaceId: string,
    @Body() body: { name: string; parent_folder_id?: string },
    @Req() req: any,
  ) {
    try {
      const userId = req.userInfo?.userId;
      const newFolder = await this.workspaceFolderService.createFolder(
        workspaceId,
        userId,
        body,
      );

      return new ApiResponse(newFolder);
    } catch (error) {
      this.logger.error(`Error creating folder: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all folders in workspace
   * NOTE_USER: Can view
   * NOTE_ADMIN: Can view all
   */
  @Get()
  @ApiOperation({ summary: 'Get all folders in workspace' })
  async getWorkspaceFolders(
    @Param('workspaceId') workspaceId: string,
    @Req() req: any,
  ) {
    try {
      const userId = req.userInfo?.userId;
      const result = await this.workspaceFolderService.getWorkspaceFolders(
        workspaceId,
        userId,
      );

      return new ApiResponse(result);
    } catch (error) {
      this.logger.error(`Error getting workspace folders: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update folder
   * Only NOTE_ADMIN can update
   */
  @Put(':folderId')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Update folder (NOTE_ADMIN only)',
    description: 'Only users with NOTE_ADMIN permission can update folders',
  })
  async updateFolder(
    @Param('workspaceId') workspaceId: string,
    @Param('folderId') folderId: string,
    @Body() body: { name?: string },
    @Req() req: any,
  ) {
    try {
      const userId = req.userInfo?.userId;
      const updatedFolder = await this.workspaceFolderService.updateFolder(
        workspaceId,
        folderId,
        userId,
        body,
      );

      return new ApiResponse(updatedFolder);
    } catch (error) {
      this.logger.error(`Error updating folder: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete folder and all its children
   * Only NOTE_ADMIN can delete
   * This will also delete all notes in the folder and child folders
   */
  @Delete(':folderId')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Delete folder and all children (NOTE_ADMIN only)',
    description:
      'Only users with NOTE_ADMIN permission can delete folders. This will delete the folder, all child folders, and all notes within them.',
  })
  async deleteFolder(
    @Param('workspaceId') workspaceId: string,
    @Param('folderId') folderId: string,
    @Req() req: any,
  ) {
    try {
      const userId = req.userInfo?.userId;
      const result = await this.workspaceFolderService.deleteFolder(
        workspaceId,
        folderId,
        userId,
      );

      return new ApiResponse(result);
    } catch (error) {
      this.logger.error(`Error deleting folder: ${error.message}`);
      throw error;
    }
  }
}
