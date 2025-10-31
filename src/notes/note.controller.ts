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
import { NoteService } from './note.service';
import { ApiResponse } from 'src/common/api-response';
import { NoteResponse } from './dto/response/NoteResponse.dto';
import { CreateNoteRequest } from './dto/request/CreateNoteRequest.dto';
import { UpdateNoteRequest } from './dto/request/UpdateNoteRequest.dto';
import { Note } from './note.schema';
import { ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { UserDto } from 'src/user-dto/user.dto';
import { CreateNoteRoomRequest } from './dto/request/CreateNoteRoomRequest.dto';
import { DeleteNoteRoomRequest } from './dto/request/DeleteNoteRoomRequest.dto';

@ApiBearerAuth('access-token')
@Controller('/note')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Get('root')
  async getNotesByUserID(@Request() req): Promise<ApiResponse<Note[]>> {
    const user = req.userInfo as UserDto;
    const notes = await this.noteService.getNotesByUserId(user.userId);
    return new ApiResponse<Note[]>(notes);
  }

  @Get('folder/:folderId')
  async getNotesByFolderID(
    @Param('folderId') folderId: string,
  ): Promise<ApiResponse<Note[]>> {
    const notes = await this.noteService.getNotesByFolderID(folderId);
    return new ApiResponse<Note[]>(notes);
  }

  @ApiBody({ type: CreateNoteRequest })
  @Post('')
  async createNote(
    @Request() req,
    @Body() createNoteDto: CreateNoteRequest,
  ): Promise<ApiResponse<NoteResponse>> {
    const user = req.userInfo as UserDto;
    const note = await this.noteService.createNote(createNoteDto, user.userId);
    return new ApiResponse<NoteResponse>(note);
  }

  @ApiBody({ type: CreateNoteRoomRequest })
  @Post('create-note-room')
  async createNoteInRoom(
    @Request() req,
    @Body() body: CreateNoteRoomRequest,
  ): Promise<ApiResponse<NoteResponse>> {
    const user = req.userInfo as UserDto;
    const note = await this.noteService.createNoteInRoom(body, user.userId);
    return new ApiResponse<NoteResponse>(note);
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiBody({ type: UpdateNoteRequest })
  @Patch('/:id')
  async updateNote(
    @Param('id') noteId: string,
    @Body() updateNoteDto: UpdateNoteRequest,
  ): Promise<ApiResponse<NoteResponse>> {
    const note = await this.noteService.updateNote(noteId, updateNoteDto);
    return new ApiResponse<NoteResponse>(note);
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @Delete('/:id')
  async deleteNote(@Param('id') noteId: string): Promise<ApiResponse<void>> {
    await this.noteService.deleteNote(noteId);
    return new ApiResponse<void>();
  }

  @ApiParam({
    name: 'noteId',
    type: String,
    description: 'Note ID to delete',
  })
  @Delete('delete-note-room/:noteId')
  async deleteNoteInRoom(
    @Param('noteId') noteId: string,
    @Request() req,
  ): Promise<ApiResponse<{ _id: string; deletedAt: Date }>> {
    const user = req.userInfo as UserDto;
    await this.noteService.deleteNoteInRoom(noteId);
    console.log(`✅ Note ${noteId} deleted by user ${user.userId}`);
    return new ApiResponse<{ _id: string; deletedAt: Date }>({
      _id: noteId,
      deletedAt: new Date(),
    });
  }

  @Get('room/:roomId')
  async getNotesByRoomId(
    @Param('roomId') roomId: string,
  ): Promise<ApiResponse<Note[]>> {
    const notes = await this.noteService.getNotesByRoomId(roomId);
    return new ApiResponse<Note[]>(notes);
  }

  @Get('/:noteId')
  async getNoteById(
    @Param('noteId') noteId: string,
  ): Promise<ApiResponse<Note>> {
    const note = await this.noteService.getNotebyId(noteId);
    return new ApiResponse<Note>(note);
  }
}
