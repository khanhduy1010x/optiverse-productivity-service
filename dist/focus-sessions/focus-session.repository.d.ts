import { Model } from 'mongoose';
import { FocusSession } from './focus-session.schema';
import { CreateFocusSessionRequest } from './dto/request/CreateFocusSessionRequest.dto';
import { UpdateFocusSessionRequest } from './dto/request/UpdateFocusSessionRequest.dto';
export declare class FocusSessionRepository {
    private readonly focusSessionModel;
    constructor(focusSessionModel: Model<FocusSession>);
    getFocusSessionsByUserID(userId: string): Promise<FocusSession[]>;
    createFocusSession(user_id: string, createFocusSessionDto: CreateFocusSessionRequest): Promise<FocusSession>;
    updateFocusSession(focusSessionId: string, updateFocusSessionDto: UpdateFocusSessionRequest): Promise<FocusSession>;
    deleteFocusSession(focusSessionId: string): Promise<void>;
}
