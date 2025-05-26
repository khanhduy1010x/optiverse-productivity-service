import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UserDto } from '../user-dto/user.dto';

interface CustomRequest extends Request {
  userInfo: UserDto | null;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const userInfoBase64 = req.headers['x-user-info'] as string;
    let user: UserDto | null = null;
    if (userInfoBase64) {
      try {
        const userInfoJson = Buffer.from(userInfoBase64, 'base64').toString();
        console.log('Decoded userInfo:', userInfoJson);
        const parsedUser = JSON.parse(userInfoJson);
        user = new UserDto();
        user.userId = parsedUser._id;
        user.email = parsedUser.email;
        user.fullName = parsedUser.full_name;
        user.avatar_url = parsedUser.avatar_url || undefined;
      } catch (error) {
        console.error('Error parsing X-User-Info:', error);
      }
    } else {
      console.warn('No X-User-Info header found');
    }

    const customReq = req as CustomRequest;
    customReq.userInfo = user;
    next();
  }
}