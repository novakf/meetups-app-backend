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

@ApiTags('Митапы')
@Controller('meetups')
export class MeetupsController {
  constructor(private meetupsService: MeetupsService) {}

  @ApiOperation({ summary: 'Получить все митапы по дате / статусу' })
  @ApiQuery({ type: GetMeetupsQuery })
  @ApiResponse({ status: 200, type: [Meetup] })
  @Get()
  getAll(@Req() request?: Request) {
    let status = request.query.status?.toString();
    let startDate = request.query.startDate?.toString();
    let endDate = request.query.endDate?.toString();

    return this.meetupsService.getAllMeetups(status, startDate, endDate);
  }

  @ApiOperation({ summary: 'Получить митап по id' })
  @ApiResponse({ status: 200, type: Meetup })
  @ApiResponse({ status: 404, type: NotFoundStatusType })
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.meetupsService.getById(id);
  }

  @ApiOperation({ summary: 'Изменить информацию о митапе' })
  @ApiBody({ type: MeetupUpdateBody })
  @ApiResponse({ status: 200, type: Meetup })
  @ApiResponse({ status: 404, type: NotFoundStatusType })
  @ApiResponse({ status: 400, type: BadRequestStatusType })
  @Put()
  update(@Body() meetupDto: CreateMeetupDto) {
    const userID = 1;
    return this.meetupsService.updateMeetup(userID, meetupDto);
  }

  @ApiOperation({ summary: 'Формирование заявки создателем' })
  @ApiResponse({ status: 200, type: Meetup })
  @ApiResponse({ status: 404, type: NotFoundStatusType })
  @ApiResponse({ status: 403, type: ForbiddenStatusType })
  @ApiResponse({ status: 400, type: BadRequestStatusType })
  @Put('/complete/creator/')
  completeByCreator() {
    const userID = 1;
    return this.meetupsService.completeMeetupByCreator(userID);
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
  @Put('/complete/moderator/:id')
  completeByModerator(
    @Param('id', ParseIntPipe) id: number,
    @Body() meetupDto: CreateMeetupDto,
  ) {
    const moderatorID = 2;
    return this.meetupsService.completeMeetupByModerator(
      id,
      moderatorID,
      meetupDto.status,
    );
  }

  @ApiOperation({ summary: 'Удаление заявки' })
  @ApiResponse({ status: 200, type: [Meetup] })
  @ApiResponse({ status: 404, type: NotFoundStatusType })
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.meetupsService.deleteMeetup(id);
  }

  @ApiTags('Спикеры, включенные в митап')
  @ApiOperation({ summary: 'Исключение спикера из митапа' })
  @ApiResponse({ status: 200, type: Meetup })
  @ApiResponse({ status: 404, type: NotFoundStatusType })
  @ApiResponse({ status: 400, type: BadRequestStatusType })
  @Delete('/speaker/:id')
  deleteSpeaker(@Param('id', ParseIntPipe) id: number) {
    const userID = 1;
    return this.meetupsService.deleteSpeakerFromMeetup(id, userID);
  }

  @ApiTags('Спикеры, включенные в митап')
  @ApiOperation({ summary: 'Изменить информацию о спикере в митапе' })
  @ApiBody({ type: MeetupSpeakerUpdateBody })
  @ApiResponse({ status: 200, type: Meetup })
  @ApiResponse({ status: 404, type: NotFoundStatusType })
  @Put('/speaker/:id')
  updateSpeaker(
    @Param('id', ParseIntPipe) id: number,
    @Body() meetupSpeakerDto: CreateMeetupSpeakerDto,
  ) {
    const userID = 1;
    return this.meetupsService.updateSpeaker(id, userID, meetupSpeakerDto);
  }
}
