import { TaskTag } from '../../task-tag.schema';

export class TaskTagResponse {
  taskTag: TaskTag;

  constructor(taskTag: TaskTag) {
    this.taskTag = taskTag;
  }
}
