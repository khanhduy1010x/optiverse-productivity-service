import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NoteService } from './note.service';
export declare class NoteGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    private readonly noteService;
    private readonly logger;
    constructor(noteService: NoteService);
    server: Server;
    private clientData;
    private cleanupInterval;
    afterInit(): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    private cleanupInactiveUsers;
    handleJoinNote(data: {
        noteId: string;
    }, client: Socket): Promise<void>;
    handleLeaveNote(data: {
        noteId: string;
    }, client: Socket): void;
    private normalizeContent;
    handleNoteUpdate(data: {
        noteId: string;
        content: string;
    }, client: Socket): Promise<void>;
    handleTyping(data: {
        noteId: string;
    }, client: Socket): void;
    handleStopTyping(data: {
        noteId: string;
    }, client: Socket): void;
    handleNoteDeleted(data: {
        noteId: string;
    }, client: Socket): void;
    handleNoteRenamed(data: {
        noteId: string;
        newTitle: string;
    }, client: Socket): void;
    handleFolderDeleted(data: {
        folderId: string;
    }, client: Socket): void;
    handleFolderStructureChanged(client: Socket): void;
    handleNoteShared(data: {
        noteId: string;
        sharedWithUserId: string;
    }, client: Socket): void;
    handleFolderShared(data: {
        folderId: string;
        sharedWithUserId: string;
    }, client: Socket): void;
    beforeApplicationShutdown(): Promise<void>;
}
