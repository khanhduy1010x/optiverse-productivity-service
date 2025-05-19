import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskEvent, TaskEventSchema } from './task-event.schema';
import { TaskEventController } from './task-event.controller';
import { TaskEventService } from './task-event.service';
import { TaskEventRepository } from './task-event.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: TaskEvent.name, schema: TaskEventSchema }])],
  controllers: [TaskEventController],
  providers: [TaskEventService, TaskEventRepository],
  exports: [TaskEventService],
})
export class TaskEventModule {}
