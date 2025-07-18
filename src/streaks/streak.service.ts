import { Injectable } from '@nestjs/common';
import { StreakRepository } from './streak.repository';
import { Streak } from './streak.schema';
import { StreakResponse } from './dto/response/StreakResponse.dto';
import { CreateStreakRequest } from './dto/request/CreateStreakRequest.dto';
import { UpdateStreakRequest } from './dto/request/UpdateStreakRequest.dto';

@Injectable()
export class StreakService {
  constructor(
    private readonly streakRepository: StreakRepository,
  ) {}

  async getStreakByUserID(userId: string): Promise<StreakResponse | null> {
    const streak = await this.streakRepository.getStreakByUserID(userId);
    if (!streak) return null;
    return new StreakResponse(streak);
  }

  async getStreakByID(streakId: string): Promise<StreakResponse> {
    const streak = await this.streakRepository.getStreakByID(streakId);
    return new StreakResponse(streak);
  }

  async createStreak(userId: string, createStreakDto: CreateStreakRequest): Promise<StreakResponse> {
    const streak = await this.streakRepository.createStreak(userId, createStreakDto);
    return new StreakResponse(streak);
  }

  async updateStreak(streakId: string, updateStreakDto: UpdateStreakRequest): Promise<StreakResponse> {
    const streak = await this.streakRepository.updateStreak(streakId, updateStreakDto);
    return new StreakResponse(streak);
  }

  async updateStreakByUserId(userId: string, updateStreakDto: UpdateStreakRequest): Promise<StreakResponse> {
    const streak = await this.streakRepository.updateStreakByUserId(userId, updateStreakDto);
    return new StreakResponse(streak);
  }

  // Helper methods for updating specific streaks
  async updateLoginStreak(userId: string): Promise<StreakResponse> {
    let streak = await this.streakRepository.getStreakByUserID(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const updateData: UpdateStreakRequest = {
      lastLoginDate: new Date()
    };
    
    if (!streak) {
      // Create new streak for user
      return await this.createStreak(userId, { 
        loginStreak: 1,
        lastLoginDate: new Date()
      });
    }
    
    if (!streak.lastLoginDate) {
      updateData.loginStreak = 1;
    } else {
      const lastLogin = new Date(streak.lastLoginDate);
      lastLogin.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // If last login was yesterday, increment streak
      if (lastLogin.getTime() === yesterday.getTime()) {
        updateData.loginStreak = (streak.loginStreak || 0) + 1;
      } 
      // If last login was today, keep streak the same
      else if (lastLogin.getTime() !== today.getTime()) {
        // Reset streak if more than a day has passed
        updateData.loginStreak = 1;
      }
    }
    
    return await this.updateStreakByUserId(userId, updateData);
  }
  
  async updateTaskStreak(userId: string): Promise<StreakResponse> {
    let streak = await this.streakRepository.getStreakByUserID(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const updateData: UpdateStreakRequest = {
      lastTaskDate: new Date()
    };
    
    if (!streak) {
      // Create new streak for user
      return await this.createStreak(userId, { 
        taskStreak: 1,
        lastTaskDate: new Date()
      });
    }
    
    if (!streak.lastTaskDate) {
      updateData.taskStreak = 1;
    } else {
      const lastTask = new Date(streak.lastTaskDate);
      lastTask.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // If last task was yesterday, increment streak
      if (lastTask.getTime() === yesterday.getTime()) {
        updateData.taskStreak = (streak.taskStreak || 0) + 1;
      } 
      // If last task was today, keep streak the same
      else if (lastTask.getTime() !== today.getTime()) {
        // Reset streak if more than a day has passed
        updateData.taskStreak = 1;
      }
    }
    
    return await this.updateStreakByUserId(userId, updateData);
  }
  
  async updateFlashcardStreak(userId: string): Promise<StreakResponse> {
    let streak = await this.streakRepository.getStreakByUserID(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const updateData: UpdateStreakRequest = {
      lastFlashcardDate: new Date()
    };
    
    if (!streak) {
      // Create new streak for user
      return await this.createStreak(userId, { 
        flashcardStreak: 1,
        lastFlashcardDate: new Date()
      });
    }
    
    if (!streak.lastFlashcardDate) {
      updateData.flashcardStreak = 1;
    } else {
      const lastFlashcard = new Date(streak.lastFlashcardDate);
      lastFlashcard.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // If last flashcard was yesterday, increment streak
      if (lastFlashcard.getTime() === yesterday.getTime()) {
        updateData.flashcardStreak = (streak.flashcardStreak || 0) + 1;
      } 
      // If last flashcard was today, keep streak the same
      else if (lastFlashcard.getTime() !== today.getTime()) {
        // Reset streak if more than a day has passed
        updateData.flashcardStreak = 1;
      }
    }
    
    return await this.updateStreakByUserId(userId, updateData);
  }
} 