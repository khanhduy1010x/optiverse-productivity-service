import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UserDto } from 'src/user-dto/user.dto';
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
        const parsedUser = JSON.parse(userInfoJson);
        user = Object.assign(new UserDto(), parsedUser);
      } catch (error) {
        console.error('Error parsing X-User-Info:', error);
      }
    }

    const customReq = req as CustomRequest;
    customReq.userInfo = user;
    console.log('req.user:', user);
    next();
  }
}
