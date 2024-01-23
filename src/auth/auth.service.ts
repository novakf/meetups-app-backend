import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/users/users.model';
import { LoginUserType } from 'src/types';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { uuid } from 'uuidv4';
import { MeetupsService } from 'src/meetups/meetups.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private meetupsService: MeetupsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async logout(token: string) {
    const user = this.jwtService.verify(token, { secret: 'SECRET' });

    const draft = await this.meetupsService.getDraft(user.id)

    if (draft) await this.meetupsService.deleteMeetup(draft.id)

    await this.cacheManager.set(uuid(), user.email.toString(), {
      ttl: 86400,
    });
  }

  async login(userDto: LoginUserType) {
    const user = await this.validateUser(userDto);

    const token = await this.generateToken(user);

    return { token, user };
  }

  async signup(userDto: CreateUserDto) {
    const candidate = await this.userService.getUserByEmail(userDto.email);
    if (candidate)
      throw new HttpException(
        'Пользователь с таким email уже существует',
        HttpStatus.BAD_REQUEST,
      );

    const hashPassword = await bcrypt.hash(userDto.password, 5);

    const user = await this.userService.createUser({
      ...userDto,
      password: hashPassword,
    });
    
    const token = await this.generateToken(user);

    return {token, user};
  }

  private async generateToken(user: User) {
    const payload = { id: user.id, email: user.email, role: user.role };

    return {
      token: this.jwtService.sign(payload),
    };
  }

  private async validateUser(userDto: LoginUserType) {
    const user = await this.userService.getUserByEmail(userDto.email);

    if (!user)
      throw new UnauthorizedException({
        message: 'Некорректный email или пароль',
      });

    const passwordEquals = await bcrypt.compare(
      userDto.password,
      user.password,
    );

    if (passwordEquals) return user;

    throw new UnauthorizedException({
      message: 'Некорректный email или пароль',
    });
  }
}
