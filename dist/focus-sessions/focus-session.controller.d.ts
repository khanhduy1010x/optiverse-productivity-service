import { FocusSessionService } from './focus-session.service';
import { ApiResponse } from 'src/common/api-response';
import { FocusSessionResponse } from './dto/response/FocusSessionResponse.dto';
import { CreateFocusSessionRequest } from './dto/request/CreateFocusSessionRequest.dto';
import { FocusSession } from './focus-session.schema';
export declare class FocusSessionController {
    private readonly focusSessionService;
    constructor(focusSessionService: FocusSessionService);
    getFocusSessionsByUserID(req: any): Promise<ApiResponse<FocusSession[]>>;
    createFocusSession(req: any, createFocusSessionDto: CreateFocusSessionRequest): Promise<ApiResponse<FocusSessionResponse>>;
    deleteFocusSession(focusSessionId: string): Promise<ApiResponse<void>>;
}
