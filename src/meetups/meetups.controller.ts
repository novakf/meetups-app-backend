import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Render,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MeetupsService } from './meetups.service';
import { CreateMeetupDto } from './dto/create-meetup.dto';
import {
  BadRequestStatusType,
  ForbiddenStatusType,
  GetMeetupsQuery,
  MeetupSpeakerUpdateBody,
  MeetupStatusType,
  MeetupUpdateBody,
  NotFoundStatusType,
} from 'src/types';
import { CreateMeetupSpeakerDto } from './dto/create-meetup-speaker.dto';
import { Request } from 'express';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Meetup } from './meetups.model';
import { Roles } from 'src/auth/roles-auth.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';

@ApiTags('Митапы')
@Controller('meetups')
export class MeetupsController {
  constructor(
    private meetupsService: MeetupsService,
    private jwtService: JwtService,
  ) {}

  @ApiOperation({ summary: 'Получить все митапы по дате / статусу' })
  @ApiQuery({ type: GetMeetupsQuery })
  @ApiResponse({ status: 200, type: [Meetup] })
  @UseGuards(JwtAuthGuard)
  @Get()
  getAll(@Req() request: Request) {
    let status = request.query.status as string[];
    let startDate = request.query.startDate?.toString();
    let endDate = request.query.endDate?.toString();

    const token = request.cookies.meetups_access_token.token;
    const user = this.jwtService.verify(token);

    return user.role === 'модератор'
      ? this.meetupsService.getAllMeetups(status, startDate, endDate)
      : this.meetupsService.getUserMeetups(user.id, status, startDate, endDate);
  }

  @ApiOperation({ summary: 'Получить митап по id' })
  @ApiResponse({ status: 200, type: Meetup })
  @ApiResponse({ status: 404, type: NotFoundStatusType })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number, @Req() request: Request) {
    const token = request.cookies.meetups_access_token.token;
    const user = this.jwtService.verify(token);
    if (user.role == 'модератор') return this.meetupsService.getById(id);
    return this.meetupsService.getById(id, user.id);
  }

  @ApiOperation({ summary: 'Изменить информацию о митапе' })
  @ApiBody({ type: MeetupUpdateBody })
  @ApiResponse({ status: 200, type: Meetup })
  @ApiResponse({ status: 404, type: NotFoundStatusType })
  @ApiResponse({ status: 400, type: BadRequestStatusType })
  @UseGuards(JwtAuthGuard)
  @Put()
  update(@Body() meetupDto: CreateMeetupDto, @Req() request: Request) {
    const token = request.cookies.meetups_access_token.token;
    const user = this.jwtService.verify(token);

    return this.meetupsService.updateMeetup(user.id, meetupDto);
  }

  @ApiOperation({ summary: 'Формирование заявки создателем' })
  @ApiResponse({ status: 200, type: Meetup })
  @ApiResponse({ status: 404, type: NotFoundStatusType })
  @ApiResponse({ status: 403, type: ForbiddenStatusType })
  @ApiResponse({ status: 400, type: BadRequestStatusType })
  @UseGuards(JwtAuthGuard)
  @Put('/complete/creator/')
  completeByCreator(@Req() request: Request) {
    const token = request.cookies.meetups_access_token.token;
    const user = this.jwtService.verify(token);
    return this.meetupsService.completeMeetupByCreator(user.id);
  }

  @ApiOperation({ summary: 'Удаление заявки через статус' })
  @ApiResponse({ status: 200, type: Meetup })
  @ApiResponse({ status: 404, type: NotFoundStatusType })
  @ApiResponse({ status: 403, type: ForbiddenStatusType })
  @ApiResponse({ status: 400, type: BadRequestStatusType })
  @UseGuards(JwtAuthGuard)
  @Put('/delete')
  deleteByCreator(@Req() request: Request) {
    const token = request.cookies.meetups_access_token.token;
    const user = this.jwtService.verify(token);
    return this.meetupsService.deleteMeetupByCreator(user.id);
  }

  @ApiOperation({ summary: 'Формирование заявки модератором' })
  @ApiResponse({ status: 200, type: Meetup })
  @ApiResponse({ status: 404, type: NotFoundStatusType })
  @ApiResponse({ status: 403, type: ForbiddenStatusType })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'отклонен' },
      },
    },
  })
  @Roles('модератор')
  @UseGuards(RolesGuard)
  @Put('/complete/moderator/:id')
  completeByModerator(
    @Param('id', ParseIntPipe) id: number,
    @Body() meetupDto: CreateMeetupDto,
    @Req() request: Request,
  ) {
    const token = request.cookies.meetups_access_token.token;
    const user = this.jwtService.verify(token);

    return this.meetupsService.completeMeetupByModerator(
      id,
      user.id,
      meetupDto.status,
    );
  }

  @ApiOperation({ summary: 'Удаление заявки' })
  @ApiResponse({ status: 200, type: [Meetup] })
  @ApiResponse({ status: 404, type: NotFoundStatusType })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.meetupsService.deleteMeetup(id);
  }

  @ApiTags('Спикеры, включенные в митап')
  @ApiOperation({ summary: 'Исключение спикера из митапа' })
  @ApiResponse({ status: 200, type: Meetup })
  @ApiResponse({ status: 404, type: NotFoundStatusType })
  @ApiResponse({ status: 400, type: BadRequestStatusType })
  @UseGuards(JwtAuthGuard)
  @Delete('/speaker/:id')
  deleteSpeaker(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    const token = request.cookies.meetups_access_token.token;
    const user = this.jwtService.verify(token);
    return this.meetupsService.deleteSpeakerFromMeetup(id, user.id);
  }

  @ApiTags('Спикеры, включенные в митап')
  @ApiOperation({ summary: 'Изменить информацию о спикере в митапе' })
  @ApiBody({ type: MeetupSpeakerUpdateBody })
  @ApiResponse({ status: 200, type: Meetup })
  @ApiResponse({ status: 404, type: NotFoundStatusType })
  @UseGuards(JwtAuthGuard)
  @Put('/speaker/:id')
  updateSpeaker(
    @Param('id', ParseIntPipe) id: number,
    @Body() meetupSpeakerDto: CreateMeetupSpeakerDto,
    @Req() request: Request,
  ) {
    console.log(meetupSpeakerDto);
    const token = request.cookies.meetups_access_token.token;
    const user = this.jwtService.verify(token);
    return this.meetupsService.updateSpeaker(id, user.id, meetupSpeakerDto);
  }
}
