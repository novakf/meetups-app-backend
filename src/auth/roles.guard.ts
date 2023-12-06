import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { ROLE_KEY } from './roles-auth.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const requiredRoles = this.reflector.getAllAndOverride<string[]>(
        ROLE_KEY,
        [context.getHandler(), context.getClass()],
      );

      if (!requiredRoles) return true;

      const req = context.switchToHttp().getRequest();
      const token = req.cookies.meetups_access_token?.token;

      if (!token)
        throw new UnauthorizedException({
          message: 'Пользователь не авторизован (без токена)',
        });

      const user = this.jwtService.verify(token);
      req.user = user;
      return requiredRoles.includes(user.role);
    } catch (e) {
      console.log(e);
      throw new HttpException(
        'Пользователь не авторизован',
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
