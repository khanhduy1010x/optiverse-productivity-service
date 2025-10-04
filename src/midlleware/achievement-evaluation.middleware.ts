import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AchievementService } from '../achievement/achievement.service';
import { UserDto } from '../user-dto/user.dto';

interface CustomRequest extends Request {
  userInfo: UserDto | null;
}

@Injectable()
export class AchievementEvaluationMiddleware implements NestMiddleware {
  private evaluationQueue: Set<string> = new Set();
  
  constructor(private readonly achievementService: AchievementService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const customReq = req as CustomRequest;
    
    // Chỉ thực hiện evaluation cho các API không phải achievement để tránh vòng lặp
    const shouldEvaluate = customReq.userInfo?.userId && 
                          !req.originalUrl.includes('/achievement') &&
                          !req.originalUrl.includes('/user-achievement') &&
                          req.method !== 'GET'; // Chỉ evaluation cho các thao tác thay đổi dữ liệu

    if (shouldEvaluate) {
      // Lắng nghe sự kiện finish để thực hiện evaluation sau khi response đã được gửi
      res.on('finish', () => {
        // Thêm delay nhỏ để đảm bảo response đã được gửi hoàn toàn
        setTimeout(() => {
          this.evaluateAchievementsAsync(customReq.userInfo!.userId);
        }, 100); // 100ms delay
      });
    }

    next();
  }

  private async evaluateAchievementsAsync(userId: string) {
    // Kiểm tra xem user này đã có trong queue chưa để tránh duplicate evaluation
    if (this.evaluationQueue.has(userId)) {
      console.log(`Achievement evaluation already in progress for user: ${userId}`);
      return;
    }

    try {
      // Thêm user vào queue
      this.evaluationQueue.add(userId);
      
      // Thực hiện evaluation trong background
      await this.achievementService.evaluateForUser(userId);
      console.log(`Achievement evaluation completed for user: ${userId}`);
    } catch (error) {
      // Log lỗi nhưng không ảnh hưởng đến API chính
      console.error(`Achievement evaluation failed for user ${userId}:`, error);
    } finally {
      // Xóa user khỏi queue sau khi hoàn thành
      this.evaluationQueue.delete(userId);
    }
  }
}