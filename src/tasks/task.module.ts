import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './task.schema';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TaskRepository } from './task.repository';
import { TaskTagModule } from '../task-tags/task-tag.module';
import { TaskTagService } from '../task-tags/task-tag.service';
import { AchievementModule } from '../achievements/achievement.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]), 
    TaskTagModule,
    forwardRef(() => AchievementModule), // Use forwardRef to avoid circular dependency
  ],
  controllers: [TaskController],
  providers: [TaskService, TaskRepository],
  exports: [TaskService, TaskRepository],
})
export class TasksModule {}
