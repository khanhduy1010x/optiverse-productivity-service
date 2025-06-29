import { FocusSessionRepository } from './focus-session.repository';
import { FocusSession } from './focus-session.schema';
import { CreateFocusSessionRequest } from './dto/request/CreateFocusSessionRequest.dto';
import { UpdateFocusSessionRequest } from './dto/request/UpdateFocusSessionRequest.dto';
import { FocusSessionResponse } from './dto/response/FocusSessionResponse.dto';
export declare class FocusSessionService {
    private readonly focusSessionRepository;
    constructor(focusSessionRepository: FocusSessionRepository);
    getFocusSessionsByUserID(userId: string): Promise<FocusSession[]>;
    createFocusSession(user_id: string, createFocusSessionDto: CreateFocusSessionRequest): Promise<FocusSessionResponse>;
    updateFocusSession(focusSessionId: string, updateFocusSessionDto: UpdateFocusSessionRequest): Promise<FocusSessionResponse>;
    deleteFocusSession(focusSessionId: string): Promise<void>;
}
