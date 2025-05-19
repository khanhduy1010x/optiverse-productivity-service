import { Task } from '../../task.schema';

export class TaskResponse {
  task: Task;

  constructor(task: Task) {
    this.task = task;
  }
}
