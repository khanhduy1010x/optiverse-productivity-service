import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NoteService } from './note.service';
import { UpdateNoteRequest } from './dto/request/UpdateNoteRequest.dto';
import { Logger } from '@nestjs/common';

interface ClientData {
  noteIds: Set<string>;
  lastActive: number;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  path: '/socket.io',
})
export class NoteGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  private readonly logger = new Logger(NoteGateway.name);

  constructor(private readonly noteService: NoteService) {}

  @WebSocketServer()
  server: Server;

  private clientData: Map<string, ClientData> = new Map();

  private cleanupInterval: NodeJS.Timeout;

  afterInit() {
    this.cleanupInterval = setInterval(
      () => {
        this.cleanupInactiveUsers();
      },
      5 * 60 * 1000,
    );
  }

  handleConnection(client: Socket) {
    this.clientData.set(client.id, {
      noteIds: new Set(),
      lastActive: Date.now(),
    });
  }

  handleDisconnect(client: Socket) {
    const clientInfo = this.clientData.get(client.id);
    if (clientInfo) {
      clientInfo.noteIds.forEach((noteId) => {
        const roomName = `note:${noteId}`;
        client.to(roomName).emit('stop_typing', {
          noteId,
          userId: client.id,
        });
      });
    }

    this.clientData.delete(client.id);
  }

  private cleanupInactiveUsers() {
    const now = Date.now();
    const inactiveThreshold = 30 * 60 * 1000;

    this.clientData.forEach((data, clientId) => {
      if (now - data.lastActive > inactiveThreshold) {
        this.clientData.delete(clientId);
      }
    });
  }

  @SubscribeMessage('join_note')
  async handleJoinNote(
    @MessageBody() data: { noteId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `note:${data.noteId}`;
    client.join(roomName);

    const clientInfo = this.clientData.get(client.id);
    if (clientInfo) {
      clientInfo.noteIds.add(data.noteId);
      clientInfo.lastActive = Date.now();
    }

    try {
      const note = await this.noteService.getNotebyId(data.noteId);

      client.emit('note_update', {
        noteId: data.noteId,
        content: note.content,
      });
    } catch (err) {
      client.emit('note_error', {
        noteId: data.noteId,
        error: 'Không tìm thấy ghi chú',
      });
    }
  }

  @SubscribeMessage('leave_note')
  handleLeaveNote(
    @MessageBody() data: { noteId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `note:${data.noteId}`;
    client.leave(roomName);

    const clientInfo = this.clientData.get(client.id);
    if (clientInfo) {
      clientInfo.noteIds.delete(data.noteId);
      clientInfo.lastActive = Date.now();

      client.to(roomName).emit('stop_typing', {
        noteId: data.noteId,
        userId: client.id,
      });
    }
  }

  private normalizeContent(content: string): string {
    if (
      content.endsWith('&#8203;') ||
      content.endsWith('\u200B') ||
      content.endsWith('&nbsp;') ||
      content.endsWith('\u00A0')
    ) {
      return content;
    }
    return content;
  }

  @SubscribeMessage('note_update')
  async handleNoteUpdate(
    @MessageBody() data: { noteId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `note:${data.noteId}`;
    const clientInfo = this.clientData.get(client.id);
    if (clientInfo) {
      clientInfo.lastActive = Date.now();
    }

    try {
      let contentToSave = this.normalizeContent(data.content);

      const dto: UpdateNoteRequest = {
        content: contentToSave,
      };

      await this.noteService.updateNote(data.noteId, dto);

      client.to(roomName).emit('note_update', {
        noteId: data.noteId,
        content: contentToSave,
      });
    } catch (err) {
      client.emit('note_error', {
        noteId: data.noteId,
        error: 'Không thể lưu ghi chú',
      });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { noteId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `note:${data.noteId}`;

    const clientInfo = this.clientData.get(client.id);
    if (clientInfo) {
      clientInfo.lastActive = Date.now();
    }

    client.to(roomName).emit('typing', {
      noteId: data.noteId,
      userId: client.id,
    });
  }

  @SubscribeMessage('stop_typing')
  handleStopTyping(
    @MessageBody() data: { noteId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `note:${data.noteId}`;

    client.to(roomName).emit('stop_typing', {
      noteId: data.noteId,
      userId: client.id,
    });
  }

  async beforeApplicationShutdown() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.server?.disconnectSockets(true);

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  }
}
