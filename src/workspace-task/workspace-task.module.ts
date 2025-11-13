import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WorkspaceTask,
  WorkspaceTaskSchema,
} from './workspace-task.schema';
import {
  WorkspaceTaskMemberPermission,
  WorkspaceTaskMemberPermissionSchema,
} from './workspace-task-member-permission.schema';
import {
  WorkspaceTaskQuota,
  WorkspaceTaskQuotaSchema,
} from './workspace-task-quota.schema';
import { WorkspaceTaskController } from './workspace-task.controller';
import { WorkspaceTaskService } from './workspace-task.service';
import { WorkspaceTaskRepository } from './workspace-task.repository';
import { WorkspaceTaskPermissionService } from './workspace-task-permission.service';
import { WorkspaceModule } from '../workspace/workspace.module';
import { AxiosClientModule } from '../http-axios/axios-client.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: WorkspaceTask.name,
        schema: WorkspaceTaskSchema,
      },
      {
        name: WorkspaceTaskMemberPermission.name,
        schema: WorkspaceTaskMemberPermissionSchema,
      },
      {
        name: WorkspaceTaskQuota.name,
        schema: WorkspaceTaskQuotaSchema,
      },
    ]),
    WorkspaceModule,
    AxiosClientModule,
  ],
  controllers: [WorkspaceTaskController],
  providers: [
    WorkspaceTaskService,
    WorkspaceTaskRepository,
    WorkspaceTaskPermissionService,
  ],
  exports: [
    WorkspaceTaskService,
    WorkspaceTaskRepository,
    WorkspaceTaskPermissionService,
  ],
})
export class WorkspaceTaskModule {}
