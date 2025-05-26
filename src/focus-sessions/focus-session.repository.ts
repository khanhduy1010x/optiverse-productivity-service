import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FocusSession } from './focus-session.schema';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { CreateFocusSessionRequest } from './dto/request/CreateFocusSessionRequest.dto';
import { UpdateFocusSessionRequest } from './dto/request/UpdateFocusSessionRequest.dto';

@Injectable()
export class FocusSessionRepository {
  constructor(
    @InjectModel(FocusSession.name) private readonly focusSessionModel: Model<FocusSession>,
  ) {}

  async getFocusSessionsByUserID(userId: string): Promise<FocusSession[]> {
    return await this.focusSessionModel.find({ user_id: new Types.ObjectId(userId) }).exec();
  }

  async createFocusSession(
    user_id: string,
    createFocusSessionDto: CreateFocusSessionRequest,
  ): Promise<FocusSession> {
    const newFocusSession = new this.focusSessionModel({
      ...createFocusSessionDto,
      user_id: new Types.ObjectId(user_id),
    });
    return await newFocusSession.save();
  }

  async updateFocusSession(
    focusSessionId: string,
    updateFocusSessionDto: UpdateFocusSessionRequest,
  ): Promise<FocusSession> {
    return await this.focusSessionModel
      .findByIdAndUpdate(focusSessionId, updateFocusSessionDto, { new: true })
      .orFail(new AppException(ErrorCode.NOT_FOUND));
  }

  async deleteFocusSession(focusSessionId: string): Promise<void> {
    const result = await this.focusSessionModel.deleteOne({ _id: focusSessionId }).exec();
    if (result.deletedCount === 0) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }
  }
}
