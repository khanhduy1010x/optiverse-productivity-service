import { TaskEvent } from '../../task-event.schema';
export declare class TaskEventResponse {
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
    constructor(taskEvent: TaskEvent);
}
