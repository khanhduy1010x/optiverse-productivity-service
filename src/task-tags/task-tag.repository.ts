import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TaskTag } from './task-tag.schema';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { CreateTaskTagRequest } from './dto/request/CreateTaskTagRequest.dto';
import { UpdateTaskTagRequest } from './dto/request/UpdateTaskTagRequest.dto';

@Injectable()
export class TaskTagRepository {
  
}
