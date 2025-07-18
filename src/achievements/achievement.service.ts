import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { AchievementRepository } from './achievement.repository';
import { Achievement } from './achievement.schema';
import { CreateAchievementRequest } from './dto/request/CreateAchievementRequest.dto';
import { UpdateAchievementRequest } from './dto/request/UpdateAchievementRequest.dto';
import { AchievementResponse } from './dto/response/AchievementResponse.dto';
import { AchievementTypeRepository } from '../achievement-type/achievement-type.repository';
import { ConditionTypeEnum } from '../achievement-type/achievement-type.schema';
import { UserAchievementRepository } from '../user-achievements/user-achievement.repository';
import { TaskRepository } from '../tasks/task.repository';
import { FriendRepository } from '../friends/friend.repository';
import { StreakRepository } from '../streaks/streak.repository';

@Injectable()
export class AchievementService {
  constructor(
    private readonly achievementRepository: AchievementRepository,
    private readonly achievementTypeRepository: AchievementTypeRepository,
    @Inject(forwardRef(() => UserAchievementRepository))
    private readonly userAchievementRepository: UserAchievementRepository,
    @Inject(forwardRef(() => TaskRepository))
    private readonly taskRepository: TaskRepository,
    @Inject(forwardRef(() => FriendRepository))
    private readonly friendRepository: FriendRepository,
    @Inject(forwardRef(() => StreakRepository))
    private readonly streakRepository: StreakRepository,
  ) {}

  /**
   * Find all achievements
   */
  async findAll(): Promise<Achievement[]> {
    return this.achievementRepository.findAll();
  }

  /**
   * Find achievement by ID
   */
  async findById(id: string): Promise<Achievement> {
    return this.achievementRepository.findById(id);
  }

  /**
   * Create a new achievement
   */
  async create(createAchievementDto: CreateAchievementRequest): Promise<Achievement> {
    return this.achievementRepository.create(createAchievementDto);
  }

  /**
   * Update an achievement
   */
  async update(id: string, updateAchievementDto: UpdateAchievementRequest): Promise<Achievement> {
    return this.achievementRepository.update(id, updateAchievementDto);
  }

  /**
   * Delete an achievement
   */
  async delete(id: string): Promise<Achievement> {
    return this.achievementRepository.delete(id);
  }

  /**
   * Check and unlock all task-related achievements for a user
   * This includes daily, weekly, and monthly achievements
   * @returns Array of newly unlocked achievement IDs
   */
  async checkAllTaskCompletedAchievements(userId: string): Promise<Achievement[]> {
    // Define the achievement types and their corresponding count methods
    const achievementChecks = [
      {
        type: ConditionTypeEnum.TASKS_COMPLETED,
        countMethod: 'countCompletedTasksToday',
        label: 'daily'
      },
      {
        type: ConditionTypeEnum.TASKS_COMPLETED_WEEKLY,
        countMethod: 'countCompletedTasksThisWeek',
        label: 'weekly'
      },
      {
        type: ConditionTypeEnum.TASKS_COMPLETED_MONTHLY,
        countMethod: 'countCompletedTasksThisMonth',
        label: 'monthly'
      }
    ];
    
    let newAchievements: Achievement[] = [];
    
    // Check each achievement type
    for (const check of achievementChecks) {
      const unlockedAchievements = await this.processAchievementCheck(userId, check.type, check.countMethod, check.label);
      if (unlockedAchievements.length > 0) {
        newAchievements = [...newAchievements, ...unlockedAchievements];
      }
    }
    
    return newAchievements;
  }

  /**
   * Check and unlock all friend-related achievements for a user
   * @returns Array of newly unlocked achievements
   */
  async checkFriendsCountAchievements(userId: string): Promise<Achievement[]> {
    // Get the count of accepted friends
    const friendCount = await this.friendRepository.countAcceptedFriends(userId);
    
    // Get all achievement types related to friend count
    const achievementTypes = await this.achievementTypeRepository.findByConditionType(
      ConditionTypeEnum.FRIENDS_COUNT
    );
    
    if (!achievementTypes || achievementTypes.length === 0) {
      return [];
    }

    // Find achievements that match the condition
    const unlockedAchievementTypes = achievementTypes.filter(
      type => friendCount >= type.condition_value
    );
    
    if (unlockedAchievementTypes.length === 0) {
      return [];
    }

    // Get achievement IDs
    const achievementIds = unlockedAchievementTypes.map(type => 
      type.achievement_id.toString()
    );

    return this.unlockAchievements(userId, achievementIds);
  }
  
  /**
   * Check and unlock all streak-related achievements for a user
   * @returns Array of newly unlocked achievements
   */
  async checkStreakAchievements(userId: string): Promise<Achievement[]> {
    const streak = await this.streakRepository.getStreakByUserID(userId);
    
    if (!streak) {
      return [];
    }
    
    // Define the streak types to check
    const streakChecks = [
      {
        type: ConditionTypeEnum.LOGIN_STREAK,
        value: streak.loginStreak || 0,
      },
      {
        type: ConditionTypeEnum.TASK_STREAK,
        value: streak.taskStreak || 0,
      },
      {
        type: ConditionTypeEnum.FLASHCARD_STREAK,
        value: streak.flashcardStreak || 0,
      }
    ];
    
    let newAchievements: Achievement[] = [];
    
    // Check each streak type
    for (const check of streakChecks) {
      const unlockedAchievements = await this.processStreakAchievement(userId, check.type, check.value);
      if (unlockedAchievements.length > 0) {
        newAchievements = [...newAchievements, ...unlockedAchievements];
      }
    }
    
    return newAchievements;
  }
  
  /**
   * Process a specific streak achievement check
   * @returns Array of newly unlocked achievements
   */
  private async processStreakAchievement(
    userId: string, 
    conditionType: ConditionTypeEnum, 
    streakValue: number
  ): Promise<Achievement[]> {
    // Get all achievement types related to this streak type
    const achievementTypes = await this.achievementTypeRepository.findByConditionType(conditionType);
    
    if (!achievementTypes || achievementTypes.length === 0) {
      return [];
    }

    // Find achievements that match the condition
    const unlockedAchievementTypes = achievementTypes.filter(
      type => streakValue >= type.condition_value
    );
    
    if (unlockedAchievementTypes.length === 0) {
      return [];
    }

    // Get achievement IDs
    const achievementIds = unlockedAchievementTypes.map(type => 
      type.achievement_id.toString()
    );

    return this.unlockAchievements(userId, achievementIds);
  }
  
  /**
   * Process a specific achievement check
   * @returns Array of newly unlocked achievements
   */
  private async processAchievementCheck(
    userId: string, 
    conditionType: ConditionTypeEnum, 
    countMethod: string,
    label: string
  ): Promise<Achievement[]> {
    // Get all achievement types related to this condition type
    const achievementTypes = await this.achievementTypeRepository.findByConditionType(conditionType);
    
    if (!achievementTypes || achievementTypes.length === 0) {
      return [];
    }

    // Count completed tasks using the appropriate method
    const taskCount = await this.taskRepository[countMethod](userId);

    // Find achievements that match the condition
    const unlockedAchievementTypes = achievementTypes.filter(
      type => taskCount >= type.condition_value
    );
    
    if (unlockedAchievementTypes.length === 0) {
      return [];
    }

    // Get achievement IDs
    const achievementIds = unlockedAchievementTypes.map(type => 
      type.achievement_id.toString()
    );

    return this.unlockAchievements(userId, achievementIds);
  }

  /**
   * Helper method to unlock achievements for a user
   * @returns Array of newly unlocked achievements
   */
  private async unlockAchievements(userId: string, achievementIds: string[]): Promise<Achievement[]> {
    // Filter out achievements the user already has
    const newAchievementIds: string[] = [];
    for (const achievementId of achievementIds) {
      const hasAchievement = await this.userAchievementRepository.checkUserHasAchievement(
        userId, 
        achievementId
      );
      
      if (!hasAchievement) {
        newAchievementIds.push(achievementId);
      }
    }

    // Create user achievements for newly unlocked achievements
    if (newAchievementIds.length > 0) {
      await this.userAchievementRepository.createManyUserAchievements(
        userId,
        newAchievementIds
      );
      
      // Fetch the actual achievement data for the newly unlocked achievements
      const newAchievements: Achievement[] = [];
      for (const id of newAchievementIds) {
        try {
          const achievement = await this.achievementRepository.findById(id);
          if (achievement) {
            newAchievements.push(achievement);
          }
        } catch (error) {
          console.error(`Error fetching achievement ${id}:`, error);
        }
      }
      
      return newAchievements;
    }
    
    return [];
  }


}
