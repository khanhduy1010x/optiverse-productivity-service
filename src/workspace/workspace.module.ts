import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Workspace, WorkspaceSchema } from './workspace.schema';
import {
  WorkspaceMember,
  WorkspaceMemberSchema,
} from './workspace-member.schema';
import {
  WorkspaceJoinRequest,
  WorkspaceJoinRequestSchema,
} from './workspace-join-request.schema';
import {
  WorkspacePermission,
  WorkspacePermissionSchema,
} from './workspace_permission.schema';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceService } from './workspace.service';
import { WorkspaceRepository } from './workspace.repository';
import { PermissionService } from './permission.service';
import { WorkspacePermissionService } from './workspace-permission.service';
import { UserHttpClient } from 'src/http-axios/user-http.client';
import { WorkspaceWebSocketGateway } from './workspace-websocket.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Workspace.name, schema: WorkspaceSchema },
      { name: WorkspaceMember.name, schema: WorkspaceMemberSchema },
      { name: WorkspaceJoinRequest.name, schema: WorkspaceJoinRequestSchema },
      { name: WorkspacePermission.name, schema: WorkspacePermissionSchema },
    ]),
  ],
  controllers: [WorkspaceController],
  providers: [
    WorkspaceService,
    WorkspaceRepository,
    PermissionService,
    WorkspacePermissionService,
    UserHttpClient,
    WorkspaceWebSocketGateway,
  ],
  exports: [
    WorkspaceService,
    WorkspaceRepository,
    PermissionService,
    WorkspacePermissionService,
  ],
})
export class WorkspaceModule {}
