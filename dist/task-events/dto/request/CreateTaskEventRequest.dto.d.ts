export declare class CreateTaskEventRequest {
    task_id: string;
    start_time: Date;
    end_time?: Date;
    repeat_type: string;
    repeat_interval?: number;
    repeat_end_date?: Date;
}
