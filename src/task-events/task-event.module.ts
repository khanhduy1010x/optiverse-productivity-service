import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskEvent, TaskEventSchema } from './task-event.schema';
import { Task, TaskSchema } from '../tasks/task.schema';
import { TaskEventController } from './task-event.controller';
import { TaskEventService } from './task-event.service';
import { TaskEventRepository } from './task-event.repository';
import { TaskEventReminderService } from './task-event-reminder.service';
import { AxiosClientModule } from '../http-axios/axios-client.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TaskEvent.name, schema: TaskEventSchema },
      { name: Task.name, schema: TaskSchema },
    ]),
    AxiosClientModule,
  ],
  controllers: [TaskEventController],
  providers: [TaskEventService, TaskEventRepository, TaskEventReminderService],
  exports: [TaskEventService],
})
export class TaskEventModule {}
