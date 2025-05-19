import { TaskEvent } from '../../task-event.schema';

export class TaskEventResponse {
  taskEvent: TaskEvent;

  constructor(taskEvent: TaskEvent) {
    this.taskEvent = taskEvent;
  }
}
