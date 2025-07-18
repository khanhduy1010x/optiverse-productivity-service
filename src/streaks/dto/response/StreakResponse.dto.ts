import { Streak } from '../../streak.schema';

export class StreakResponse {
  streak: Streak;
 
  constructor(streak: Streak) {
    this.streak = streak;
  }
} 