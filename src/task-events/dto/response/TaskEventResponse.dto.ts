import { TaskEvent } from '../../task-event.schema';

export class TaskEventResponse {
  _id: string;
  task_id: string;
  title: string;
  description?: string;
  start_time: Date;
  end_time?: Date;
  repeat_type: string;
  repeat_interval?: number;
  repeat_end_date?: Date;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(taskEvent: TaskEvent) {
    this._id = taskEvent._id.toString();
    this.task_id = taskEvent.task_id.toString();
    this.title = taskEvent.title || 'Untitled Event';
    this.description = taskEvent.description;
    this.start_time = taskEvent.start_time;
    this.end_time = taskEvent.end_time;
    this.repeat_type = taskEvent.repeat_type;
    this.repeat_interval = taskEvent.repeat_interval;
    this.repeat_end_date = taskEvent.repeat_end_date;
    
    // Thêm timestamps nếu có
    if ('createdAt' in taskEvent && taskEvent['createdAt'] instanceof Date) {
      this.createdAt = taskEvent['createdAt'] as Date;
    }
    if ('updatedAt' in taskEvent && taskEvent['updatedAt'] instanceof Date) {
      this.updatedAt = taskEvent['updatedAt'] as Date;
    }
  }
}
