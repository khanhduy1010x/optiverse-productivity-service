import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Request,
  Patch,
} from '@nestjs/common';
import { NoteFolderService } from './note-folder.service';
import { ApiResponse } from 'src/common/api-response';
import { NoteFolderResponse } from './dto/response/NoteFolderResponse.dto';
import { CreateNoteFolderRequest } from './dto/request/CreateNoteFolderRequest.dto';
import { UpdateNoteFolderRequest } from './dto/request/UpdateNoteFolderRequest.dto';
import { NoteFolder, RootItem } from './note-folder.schema';
import { ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { UserDto } from 'src/user-dto/user.dto';

@ApiBearerAuth('access-token')
@Controller('/note-folder')
export class NoteFolderController {
  constructor(private readonly noteFolderService: NoteFolderService) {}

  @Get('root')
  async getNoteFoldersByUserID(@Request() req): Promise<ApiResponse<NoteFolder[]>> {
    const user = req.userInfo as UserDto;
    const noteFolders = await this.noteFolderService.getNoteFoldersByUserID(user.userId);
    return new ApiResponse<NoteFolder[]>(noteFolders);
  }

  @Get('/:id')
  async getNoteFolderById(@Param('id') folderId: string): Promise<ApiResponse<NoteFolder>> {
    const noteFolder = await this.noteFolderService.getFolderById(folderId);
    return new ApiResponse<NoteFolder>(noteFolder);
  }

  @ApiBody({ type: CreateNoteFolderRequest })
  @Post('')
  async createNoteFolder(
    @Request() req,
    @Body() createNoteFolderDto: CreateNoteFolderRequest,
  ): Promise<ApiResponse<NoteFolderResponse>> {
    const user = req.userInfo as UserDto;
    const noteFolder = await this.noteFolderService.createNoteFolder(
      createNoteFolderDto,
      user.userId,
    );
    return new ApiResponse<NoteFolderResponse>(noteFolder);
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiBody({ type: UpdateNoteFolderRequest })
  @Patch('/:id')
  async updateNoteFolder(
    @Param('id') noteFolderId: string,
    @Body() updateNoteFolderDto: UpdateNoteFolderRequest,
  ): Promise<ApiResponse<NoteFolderResponse>> {
    const noteFolder = await this.noteFolderService.updateNoteFolder(
      noteFolderId,
      updateNoteFolderDto,
    );
    return new ApiResponse<NoteFolderResponse>(noteFolder);
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @Delete('/:id')
  async deleteNoteFolder(@Param('id') noteFolderId: string): Promise<ApiResponse<void>> {
    const result = await this.noteFolderService.deleteNoteFolder(noteFolderId);
    return new ApiResponse<void>(null);
  }
  @Get('/root/retrive')
  async retriveAllRootFolder(@Request() req): Promise<ApiResponse<NoteFolder[]>> {
    const user = req.userInfo as UserDto;
    const noteFolders = await this.noteFolderService.retrieveAllFolderInRoot(user.userId);
    return new ApiResponse<NoteFolder[]>(noteFolders);
  }
   @Get('/root/retrive-web')
  async retriveAllRootFolderForWeb(@Request() req): Promise<ApiResponse<RootItem[]>> {
    const user = req.userInfo as UserDto;
    const noteFolders = await this.noteFolderService.retrieveAllFolderInRootforWeb(user.userId);
    return new ApiResponse<RootItem[]>(noteFolders);
  }
}
