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
      const requiredRole = this.reflector.getAllAndOverride<string>(ROLE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      if (!requiredRole) return true;

      const req = context.switchToHttp().getRequest();

      const authHeader = req.headers.authorization;
      const [bearer, token] = authHeader.split(' ');

      if (bearer !== 'Bearer' || !token)
        throw new UnauthorizedException({
          message: 'Пользователь не авторизован',
        });

      const user = this.jwtService.verify(token);
      req.user = user;
      return requiredRole === user.role;
    } catch (e) {
      throw new HttpException(
        'Пользователь не авторизован',
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
