import { TaskEvent } from '../../task-event.schema';

export class TaskEventResponse {
  _id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: Date;
  end_time?: Date;
  all_day?: boolean;
  repeat_type: string;
  repeat_interval?: number;
  repeat_days?: number[];
  repeat_end_type?: string;
  repeat_end_date?: Date;
  repeat_occurrences?: number;
  repeat_frequency?: number;
  repeat_unit?: string;
  exclusion_dates?: Date[];
  location?: string;
  guests?: string[];
  color?: string;
  parent_event_id?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(taskEvent: TaskEvent) {
    this._id = taskEvent._id.toString();
    this.user_id = taskEvent.user_id.toString();
    this.title = taskEvent.title || 'Untitled Event';
    this.description = taskEvent.description;
    this.start_time = taskEvent.start_time;
    this.end_time = taskEvent.end_time;
    this.all_day = taskEvent.all_day;
    this.repeat_type = taskEvent.repeat_type;
    this.repeat_interval = taskEvent.repeat_interval;
    this.repeat_days = taskEvent.repeat_days;
    this.repeat_end_type = taskEvent.repeat_end_type;
    this.repeat_end_date = taskEvent.repeat_end_date;
    this.repeat_occurrences = taskEvent.repeat_occurrences;
    this.repeat_frequency = taskEvent.repeat_frequency;
    this.repeat_unit = taskEvent.repeat_unit;
    this.exclusion_dates = taskEvent.exclusion_dates;
    this.location = taskEvent.location;
    this.guests = taskEvent.guests;
    this.color = taskEvent.color;
    this.parent_event_id = taskEvent.parent_event_id?.toString();
    
    // Thêm timestamps nếu có
    if ('createdAt' in taskEvent && taskEvent['createdAt'] instanceof Date) {
      this.createdAt = taskEvent['createdAt'] as Date;
    }
    if ('updatedAt' in taskEvent && taskEvent['updatedAt'] instanceof Date) {
      this.updatedAt = taskEvent['updatedAt'] as Date;
    }
  }
}
