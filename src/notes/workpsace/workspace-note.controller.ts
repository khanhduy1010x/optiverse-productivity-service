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
import { WorkspaceNoteService } from './workspace-note.service';
import { ApiResponse } from '../../common/api-response';
import { WorkspacePermissionService } from '../../workspace/workspace-permission.service';

@ApiTags('Workspace Notes')
@Controller('workspace/:workspaceId/notes')
@ApiBearerAuth()
export class WorkspaceNoteController {
  private readonly logger = new Logger(WorkspaceNoteController.name);

  constructor(
    private readonly workspaceNoteService: WorkspaceNoteService,
    private readonly workspacePermissionService: WorkspacePermissionService,
  ) {}

  /**
   * Create new note in workspace
   * Only NOTE_ADMIN can create
   */
  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Create new note (NOTE_ADMIN only)',
    description:
      'Only users with NOTE_ADMIN permission can create notes. folder_id is optional.',
  })
  async createNote(
    @Param('workspaceId') workspaceId: string,
    @Body() body: { title: string; content?: string; folder_id?: string },
    @Req() req: any,
  ) {
    try {
      const userId = req.userInfo?.userId;
      const newNote = await this.workspaceNoteService.createNote(
        workspaceId,
        userId,
        body,
      );

      return new ApiResponse(newNote);
    } catch (error) {
      this.logger.error(`Error creating note: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all notes in workspace
   * NOTE_USER: Can view
   * NOTE_ADMIN: Can view all
   */
  @Get()
  @ApiOperation({ summary: 'Get all notes in workspace' })
  async getWorkspaceNotes(
    @Param('workspaceId') workspaceId: string,
    @Req() req: any,
  ) {
    try {
      const userId = req.userInfo?.userId;
      const result = await this.workspaceNoteService.getWorkspaceNotes(
        workspaceId,
        userId,
      );

      return new ApiResponse(result);
    } catch (error) {
      this.logger.error(`Error getting workspace notes: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check NOTE permission for current user in workspace (NOTE_ADMIN)
   */
  @Get('permission')
  @ApiOperation({ summary: 'Check NOTE permission (NOTE_ADMIN)' })
  async checkNotePermission(
    @Param('workspaceId') workspaceId: string,
    @Req() req: any,
  ) {
    try {
      const userId = req.userInfo?.userId;
      const isNoteAdmin =
        await this.workspacePermissionService.hasPermissionNote(
          workspaceId,
          userId,
          'NOTE_ADMIN',
        );

      return new ApiResponse({ isNoteAdmin });
    } catch (error) {
      this.logger.error(`Error checking note permission: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get note detail by ID
   */
  @Get(':noteId')
  @ApiOperation({ summary: 'Get note detail by ID' })
  async getNoteDetail(
    @Param('workspaceId') workspaceId: string,
    @Param('noteId') noteId: string,
    @Req() req: any,
  ) {
    try {
      const userId = req.userInfo?.userId;
      const note = await this.workspaceNoteService.getNoteDetail(
        workspaceId,
        noteId,
        userId,
      );

      return new ApiResponse(note);
    } catch (error) {
      this.logger.error(`Error getting note detail: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update note
   * Only NOTE_ADMIN can update
   */
  @Put(':noteId')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Update note (NOTE_ADMIN only)',
    description: 'Only users with NOTE_ADMIN permission can update notes',
  })
  async updateNote(
    @Param('workspaceId') workspaceId: string,
    @Param('noteId') noteId: string,
    @Body() body: { title?: string; content?: string },
    @Req() req: any,
  ) {
    try {
      const userId = req.userInfo?.userId;
      const updatedNote = await this.workspaceNoteService.updateNote(
        workspaceId,
        noteId,
        userId,
        body,
      );

      return new ApiResponse(updatedNote);
    } catch (error) {
      this.logger.error(`Error updating note: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete note
   * Only NOTE_ADMIN can delete
   */
  @Delete(':noteId')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Delete note (NOTE_ADMIN only)',
    description: 'Only users with NOTE_ADMIN permission can delete notes',
  })
  async deleteNote(
    @Param('workspaceId') workspaceId: string,
    @Param('noteId') noteId: string,
    @Req() req: any,
  ) {
    try {
      const userId = req.userInfo?.userId;
      const result = await this.workspaceNoteService.deleteNote(
        workspaceId,
        noteId,
        userId,
      );

      return new ApiResponse(result);
    } catch (error) {
      this.logger.error(`Error deleting note: ${error.message}`);
      throw error;
    }
  }
}
