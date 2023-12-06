import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from './auth.service';
import {
  BadRequestStatusType,
  LoginUserType,
  UnauthorizedStatusType,
} from 'src/types';
import { Request, Response } from 'express';

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
        status: { type: 'string', example: 'ok' },
      },
    },
  })
  @ApiResponse({ status: 401, type: UnauthorizedStatusType })
  @ApiResponse({ status: 400, type: BadRequestStatusType })
  @Post('/login')
  async login(
    @Body() userDto: LoginUserType,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.authService.login(userDto);
    if (!token) res.status(400).send({ status: 'error' });
    res
      .cookie('meetups_access_token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), //1 day
      })
      .status(200)
      .send({ status: 'ok' });
  }

  @ApiOperation({ summary: 'Регистрация пользователя' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
      },
    },
  })
  @ApiResponse({ status: 400, type: BadRequestStatusType })
  @Post('/signup')
  async signup(
    @Body() userDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.authService.signup(userDto);
    if (!token) res.status(400).send({ status: 'error' });
    res
      .cookie('meetups_access_token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), //1 day
      })
      .status(200)
      .send({ status: 'ok' });
  }

  @ApiOperation({ summary: 'Выход их аккаунта' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
      },
    },
  })
  @ApiResponse({ status: 401, type: UnauthorizedStatusType })
  @ApiResponse({ status: 400, type: BadRequestStatusType })
  @Post('/logout')
  async logout(@Res({ passthrough: true }) res: Response, @Req() request: Request) {
    const token = request.cookies.meetups_access_token.token
    console.log(token)
    await this.authService.logout(token)
    res.clearCookie('meetups_access_token').status(200).send({ status: 'ok' });

  }
}
