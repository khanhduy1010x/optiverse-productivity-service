import { Injectable } from '@nestjs/common';
import { FocusSessionRepository } from './focus-session.repository';
import { FocusSession } from './focus-session.schema';
import { CreateFocusSessionRequest } from './dto/request/CreateFocusSessionRequest.dto';
import { UpdateFocusSessionRequest } from './dto/request/UpdateFocusSessionRequest.dto';
import { FocusSessionResponse } from './dto/response/FocusSessionResponse.dto';

@Injectable()
export class FocusSessionService {
  constructor(private readonly focusSessionRepository: FocusSessionRepository) {}

  async getFocusSessionsByUserID(userId: string): Promise<FocusSession[]> {
    return await this.focusSessionRepository.getFocusSessionsByUserID(userId);
  }

  async createFocusSession(
    user_id: string,
    createFocusSessionDto: CreateFocusSessionRequest,
  ): Promise<FocusSessionResponse> {
    const focusSession = await this.focusSessionRepository.createFocusSession(
      user_id,
      createFocusSessionDto,
    );
    return new FocusSessionResponse(focusSession);
  }

  async updateFocusSession(
    focusSessionId: string,
    updateFocusSessionDto: UpdateFocusSessionRequest,
  ): Promise<FocusSessionResponse> {
    const focusSession = await this.focusSessionRepository.updateFocusSession(
      focusSessionId,
      updateFocusSessionDto,
    );
    return new FocusSessionResponse(focusSession);
  }

  async deleteFocusSession(focusSessionId: string): Promise<void> {
    return await this.focusSessionRepository.deleteFocusSession(focusSessionId);
  }
}
