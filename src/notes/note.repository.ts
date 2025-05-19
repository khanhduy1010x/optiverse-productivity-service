import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Note } from './note.schema';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { CreateNoteRequest } from './dto/request/CreateNoteRequest.dto';
import { UpdateNoteRequest } from './dto/request/UpdateNoteRequest.dto';

@Injectable()
export class NoteRepository {
  
}
