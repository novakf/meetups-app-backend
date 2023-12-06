import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const req = context.switchToHttp().getRequest();
      const token = req.cookies.meetups_access_token?.token;
      
      if (!token)
        throw new UnauthorizedException({
          message: 'Пользователь не авторизован (без токена)',
        });

      const user = this.jwtService.verify(token, {secret: 'SECRET'});
      req.user = user;
      return true;
    } catch (e) {
      console.log(e)
      throw new UnauthorizedException({
        message: 'Пользователь не авторизован',
      });
    }
  }
}
