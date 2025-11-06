import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { Inject, Logger } from '@nestjs/common';
import { WorkspaceNoteService } from '../notes/workpsace/workspace-note.service';

@WebSocketGateway({
  namespace: '/workspace',
  cors: {
    origin: '*',
  },
  path: '/socket.io',
})
export class WorkspaceWebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(WorkspaceWebSocketGateway.name);

  @WebSocketServer() server: Server;

  constructor(
    @Inject(WorkspaceNoteService)
    private readonly workspaceNoteService: WorkspaceNoteService,
  ) {}

  afterInit(server: Server) {
    console.log('Workspace WebSocket Gateway initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // User joins workspace room for general events (ban, remove)
  @SubscribeMessage('join-workspace')
  handleJoinWorkspace(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { workspaceId: string; userId: string },
  ) {
    const roomName = `workspace:${data.workspaceId}`;
    client.join(roomName);

    // Store user info for this socket
    client.data = {
      ...client.data,
      userId: data.userId,
      workspaceId: data.workspaceId,
    };

    console.log(`User ${data.userId} joined workspace room ${roomName}`);
    return { success: true, room: roomName };
  }

  // User joins dashboard room for detailed events (role, permissions)
  @SubscribeMessage('join-dashboard')
  handleJoinDashboard(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { workspaceId: string; userId: string },
  ) {
    const dashboardRoom = `workspace:${data.workspaceId}:dashboard`;
    client.join(dashboardRoom);

    // Update client data
    client.data = {
      ...client.data,
      userId: data.userId,
      workspaceId: data.workspaceId,
      isDashboard: true,
    };

    console.log(`User ${data.userId} joined dashboard room ${dashboardRoom}`);
    return { success: true, room: dashboardRoom };
  }

  // User leaves workspace room
  @SubscribeMessage('leave-workspace')
  handleLeaveWorkspace(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { workspaceId: string },
  ) {
    const roomName = `workspace:${data.workspaceId}`;
    client.leave(roomName);
    console.log(`Client left workspace room ${roomName}`);
  }

  // User leaves dashboard room
  @SubscribeMessage('leave-dashboard')
  handleLeaveDashboard(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { workspaceId: string },
  ) {
    const dashboardRoom = `workspace:${data.workspaceId}:dashboard`;
    client.leave(dashboardRoom);

    // Update client data
    if (client.data) {
      client.data.isDashboard = false;
    }

    console.log(`Client left dashboard room ${dashboardRoom}`);
  }

  // ========== Note Room Handlers ==========

  // User joins specific note room for real-time collaboration
  @SubscribeMessage('join-note-room')
  handleJoinNoteRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      noteId: string;
      workspaceId: string;
      userId: string;
      canEdit: boolean;
    },
  ) {
    const noteRoomName = `note:${data.noteId}`;
    client.join(noteRoomName);

    // Store note info for this socket
    client.data = {
      ...client.data,
      noteId: data.noteId,
      canEdit: data.canEdit,
    };

    console.log(`User ${data.userId} joined note room ${noteRoomName}`, {
      canEdit: data.canEdit,
    });

    // Notify others in room that user joined
    this.server.to(noteRoomName).emit('user-joined-note', {
      userId: data.userId,
      noteId: data.noteId,
      canEdit: data.canEdit,
      timestamp: new Date(),
    });

    return { success: true, room: noteRoomName };
  }

  // User leaves specific note room
  @SubscribeMessage('leave-note-room')
  handleLeaveNoteRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { noteId: string },
  ) {
    const noteRoomName = `note:${data.noteId}`;
    client.leave(noteRoomName);

    // Update client data
    if (client.data) {
      client.data.noteId = null;
      client.data.canEdit = false;
    }

    console.log(`Client left note room ${noteRoomName}`);

    // Notify others that user left
    this.server.to(noteRoomName).emit('user-left-note', {
      userId: client.data?.userId,
      noteId: data.noteId,
      timestamp: new Date(),
    });
  }

  // Handle real-time note content updates
  @SubscribeMessage('note-update')
  async handleNoteUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      noteId: string;
      workspaceId: string;
      userId: string;
      content: string;
      updatedAt: Date;
    },
  ) {
    try {
      const noteRoomName = `note:${data.noteId}`;

      // Save to database
      await this.workspaceNoteService.updateNote(
        data.workspaceId,
        data.noteId,
        data.userId,
        {
          content: data.content,
        },
      );

      this.logger.log(
        `Note saved to DB: ${data.noteId} by user ${data.userId}`,
      );

      // Broadcast update to all users in the note room EXCEPT sender
      client.broadcast.to(noteRoomName).emit('note-updated', {
        noteId: data.noteId,
        workspaceId: data.workspaceId,
        userId: data.userId,
        content: data.content,
        updatedAt: data.updatedAt,
      });

      console.log(`Note update emitted to room ${noteRoomName}`, {
        noteId: data.noteId,
        userId: data.userId,
      });
    } catch (error) {
      this.logger.error(`Error updating note: ${error.message}`, error.stack);
      // Send error back to client
      client.emit('note-update-error', {
        noteId: data.noteId,
        error: error.message,
      });
    }
  }

  // ========== Event Listeners ==========

  // Focus room join request created - notify dashboard users
  @OnEvent('focus-room.join-request.created')
  handleFocusRoomJoinRequestCreated(payload: {
    roomId: string;
    userId: string;
    workspaceId?: string;
    timestamp: Date;
  }) {
    if (payload.workspaceId) {
      const dashboardRoom = `workspace:${payload.workspaceId}:dashboard`;

      this.server.to(dashboardRoom).emit('focus-room-join-request-created', {
        roomId: payload.roomId,
        userId: payload.userId,
        workspaceId: payload.workspaceId,
        timestamp: payload.timestamp,
      });

      console.log(
        `Emitted focus-room-join-request-created event to dashboard room ${dashboardRoom}`,
        payload,
      );
    }
  }

  // Focus room join request approved - notify dashboard users
  @OnEvent('focus-room.join-request.approved')
  handleFocusRoomJoinRequestApproved(payload: {
    roomId: string;
    requestId: string;
    targetUserId: string;
    approvedBy: string;
    workspaceId?: string;
    timestamp: Date;
  }) {
    if (payload.workspaceId) {
      const dashboardRoom = `workspace:${payload.workspaceId}:dashboard`;

      this.server.to(dashboardRoom).emit('focus-room-join-request-approved', {
        roomId: payload.roomId,
        requestId: payload.requestId,
        targetUserId: payload.targetUserId,
        approvedBy: payload.approvedBy,
        workspaceId: payload.workspaceId,
        timestamp: payload.timestamp,
      });

      console.log(
        `Emitted focus-room-join-request-approved event to dashboard room ${dashboardRoom}`,
        payload,
      );
    }
  }

  // Focus room join request rejected - notify dashboard users
  @OnEvent('focus-room.join-request.rejected')
  handleFocusRoomJoinRequestRejected(payload: {
    roomId: string;
    requestId: string;
    targetUserId: string;
    rejectedBy: string;
    workspaceId?: string;
    timestamp: Date;
  }) {
    if (payload.workspaceId) {
      const dashboardRoom = `workspace:${payload.workspaceId}:dashboard`;

      this.server.to(dashboardRoom).emit('focus-room-join-request-rejected', {
        roomId: payload.roomId,
        requestId: payload.requestId,
        targetUserId: payload.targetUserId,
        rejectedBy: payload.rejectedBy,
        workspaceId: payload.workspaceId,
        timestamp: payload.timestamp,
      });

      console.log(
        `Emitted focus-room-join-request-rejected event to dashboard room ${dashboardRoom}`,
        payload,
      );
    }
  }

  // Member was banned - notify all workspace users
  @OnEvent('workspace.member.banned')
  handleMemberBanned(payload: {
    workspaceId: string;
    userId: string;
    bannedBy: string;
    timestamp: Date;
  }) {
    const roomName = `workspace:${payload.workspaceId}`;

    this.server.to(roomName).emit('member-banned', {
      userId: payload.userId,
      bannedBy: payload.bannedBy,
      timestamp: payload.timestamp,
      workspaceId: payload.workspaceId,
    });

    console.log(`Emitted member-banned event to room ${roomName}`, payload);
  }

  // Member was removed - notify all workspace users
  @OnEvent('workspace.member.removed')
  handleMemberRemoved(payload: {
    workspaceId: string;
    userId: string;
    removedBy: string;
    timestamp: Date;
  }) {
    const roomName = `workspace:${payload.workspaceId}`;

    this.server.to(roomName).emit('member-removed', {
      userId: payload.userId,
      removedBy: payload.removedBy,
      timestamp: payload.timestamp,
      workspaceId: payload.workspaceId,
    });

    console.log(`Emitted member-removed event to room ${roomName}`, payload);
  }

  // Member role changed - notify dashboard users only
  @OnEvent('workspace.member.role-changed')
  handleRoleChanged(payload: {
    workspaceId: string;
    userId: string;
    newRole: string;
    oldRole: string;
    changedBy: string;
    timestamp: Date;
  }) {
    const dashboardRoom = `workspace:${payload.workspaceId}:dashboard`;

    this.server.to(dashboardRoom).emit('role-changed', {
      userId: payload.userId,
      newRole: payload.newRole,
      oldRole: payload.oldRole,
      changedBy: payload.changedBy,
      timestamp: payload.timestamp,
      workspaceId: payload.workspaceId,
    });

    console.log(
      `Emitted role-changed event to dashboard room ${dashboardRoom}`,
      payload,
    );
  }

  // Member permissions changed - notify dashboard users only
  @OnEvent('workspace.member.permissions-changed')
  handlePermissionsChanged(payload: {
    workspaceId: string;
    userId: string;
    newPermissions: string[];
    changedBy: string;
    timestamp: Date;
  }) {
    const dashboardRoom = `workspace:${payload.workspaceId}:dashboard`;

    this.server.to(dashboardRoom).emit('permissions-changed', {
      userId: payload.userId,
      newPermissions: payload.newPermissions,
      changedBy: payload.changedBy,
      timestamp: payload.timestamp,
      workspaceId: payload.workspaceId,
    });

    console.log(
      `Emitted permissions-changed event to dashboard room ${dashboardRoom}`,
      payload,
    );
  }

  // ========== Direct Emit Methods ==========

  /**
   * Emit when a user is banned from workspace
   */
  emitUserBanned(
    workspaceId: string,
    payload: {
      targetUserId: string;
      bannedBy: string;
    },
  ): void {
    const roomName = `workspace:${workspaceId}`;
    const dashboardRoom = `workspace:${workspaceId}:dashboard`;

    // Send to workspace room for redirect
    this.server.to(roomName).emit('user-banned', {
      workspaceId,
      userId: payload.targetUserId,
      bannedBy: payload.bannedBy,
      timestamp: new Date(),
    });

    // Send to dashboard room for UI refresh
    this.server.to(dashboardRoom).emit('member-banned', {
      workspaceId,
      userId: payload.targetUserId,
      bannedBy: payload.bannedBy,
      timestamp: new Date(),
    });
  }

  /**
   * Emit when a user is removed from workspace
   */
  emitUserRemoved(
    workspaceId: string,
    payload: {
      targetUserId: string;
      removedBy: string;
    },
  ): void {
    const roomName = `workspace:${workspaceId}`;
    const dashboardRoom = `workspace:${workspaceId}:dashboard`;

    // Send to workspace room for redirect
    this.server.to(roomName).emit('user-removed', {
      workspaceId,
      userId: payload.targetUserId,
      removedBy: payload.removedBy,
      timestamp: new Date(),
    });

    // Send to dashboard room for UI refresh
    this.server.to(dashboardRoom).emit('member-removed', {
      workspaceId,
      userId: payload.targetUserId,
      removedBy: payload.removedBy,
      timestamp: new Date(),
    });
  }

  /**
   * Emit when a user's role is changed
   */
  emitRoleChanged(
    workspaceId: string,
    payload: {
      targetUserId: string;
      newRole: string;
      changedBy: string;
    },
  ): void {
    const dashboardRoom = `workspace:${workspaceId}:dashboard`;

    this.server.to(dashboardRoom).emit('role-changed', {
      workspaceId,
      userId: payload.targetUserId,
      newRole: payload.newRole,
      changedBy: payload.changedBy,
      timestamp: new Date(),
    });
  }

  /**
   * Emit when a user's permissions are changed
   */
  emitPermissionsChanged(
    workspaceId: string,
    payload: {
      targetUserId: string;
      newPermissions: string[];
      changedBy: string;
    },
  ): void {
    const dashboardRoom = `workspace:${workspaceId}:dashboard`;

    this.server.to(dashboardRoom).emit('permissions-changed', {
      workspaceId,
      userId: payload.targetUserId,
      newPermissions: payload.newPermissions,
      changedBy: payload.changedBy,
      timestamp: new Date(),
    });
  }
}
