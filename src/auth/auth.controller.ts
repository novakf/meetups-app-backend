import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from './auth.service';
import {
  BadRequestStatusType,
  LoginUserType,
  UnauthorizedStatusType,
} from 'src/types';

@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Авторизация пользователя' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string', example: '2$dgkndvkjno2' },
      },
    },
  })
  @ApiResponse({ status: 401, type: UnauthorizedStatusType })
  @Post('/login')
  login(@Body() userDto: LoginUserType) {
    return this.authService.login(userDto);
  }

  @ApiOperation({ summary: 'Регистрация пользователя' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string', example: '2$dgkndvkjno2' },
      },
    },
  })
  @ApiResponse({ status: 400, type: BadRequestStatusType })
  @Post('/signup')
  signup(@Body() userDto: CreateUserDto) {
    return this.authService.signup(userDto);
  }
}
