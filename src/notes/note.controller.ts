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

@ApiBearerAuth('access-token')
@Controller('/note')
export class NoteController {
  
}
