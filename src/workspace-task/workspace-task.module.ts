import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WorkspaceTask,
  WorkspaceTaskSchema,
} from './workspace-task.schema';
import { WorkspaceTaskController } from './workspace-task.controller';
import { WorkspaceTaskService } from './workspace-task.service';
import { WorkspaceTaskRepository } from './workspace-task.repository';
import { WorkspaceModule } from '../workspace/workspace.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: WorkspaceTask.name,
        schema: WorkspaceTaskSchema,
      },
    ]),
    WorkspaceModule,
  ],
  controllers: [WorkspaceTaskController],
  providers: [WorkspaceTaskService, WorkspaceTaskRepository],
  exports: [WorkspaceTaskService, WorkspaceTaskRepository],
})
export class WorkspaceTaskModule {}
