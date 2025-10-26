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
    private usersViewingSharedItems;
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
        userId: string;
    }, client: Socket): Promise<void>;
    handleNoteRenamed(data: {
        noteId: string;
        newTitle: string;
        userId: string;
    }, client: Socket): Promise<void>;
    private isUserInRoom;
    handleViewingSharedItems(payload: any): void;
    private isUserViewingSharedItems;
    handleFolderDeleted(data: {
        folderId: string;
        userId: string;
    }, client: Socket): Promise<void>;
    handleFolderRenamed(data: {
        folderId: string;
        newName: string;
        userId: string;
    }, client: Socket): Promise<void>;
    handleFolderStructureChanged(payload: any): void;
    handleJoinUserRoom(data: {
        userId: string;
    }, client: Socket): void;
    handleLeaveUserRoom(data: {
        userId: string;
    }, client: Socket): void;
    handleNoteShared(data: {
        noteId: string;
        sharedWithUserId: string;
        userId: string;
    }, client: Socket): void;
    handleFolderShared(data: {
        folderId: string;
        sharedWithUserId: string;
        userId: string;
    }, client: Socket): void;
    handleNoteUserRemoved(data: {
        noteId: string;
        removedUserId: string;
        userId: string;
    }, client: Socket): Promise<void>;
    handleFolderUserRemoved(data: {
        folderId: string;
        removedUserId: string;
        userId: string;
    }, client: Socket): Promise<void>;
    beforeApplicationShutdown(): Promise<void>;
}
