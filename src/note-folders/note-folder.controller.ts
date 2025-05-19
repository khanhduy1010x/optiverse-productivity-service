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
import { NoteFolder } from './note-folder.schema';
import { ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { UserDto } from 'src/user-dto/user.dto';

@ApiBearerAuth('access-token')
@Controller('/note-folder')
export class NoteFolderController {
  
}
