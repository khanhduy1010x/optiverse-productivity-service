import { ApiProperty } from '@nestjs/swagger';
import { Task } from '../../task.schema';

export class GetAllTaskReponse {
  listTask: Array<Task>;

  constructor(listTask: Array<Task> = []) {
    this.listTask = listTask;
  }
}
