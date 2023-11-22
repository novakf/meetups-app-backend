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
import { MeetupStatusType } from 'src/types';
import { CreateMeetupSpeakerDto } from './dto/create-meetup-speaker.dto';
import { Request } from 'express';

@Controller('meetups')
export class MeetupsController {
  constructor(private meetupsService: MeetupsService) {}

  @Get()
  getAll(@Req() request?: Request) {
    let status = request.query.status?.toString();

    return this.meetupsService.getAllMeetups(status);
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.meetupsService.getById(id);
  }

  @Put()
  update(
    @Body() meetupDto: CreateMeetupDto,
  ) {
    const userID = 1
    return this.meetupsService.updateMeetup(userID, meetupDto);
  }

  @Put('/complete/creator/')
  completeByCreator() {
    const userID = 1
    return this.meetupsService.completeMeetupByCreator(userID);
  }

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

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.meetupsService.deleteMeetup(id);
  }

  @Delete('/speaker/:id')
  deleteSpeaker(@Param('id', ParseIntPipe) id: number) {
    const userID = 1;
    return this.meetupsService.deleteSpeakerFromMeetup(id, userID);
  }

  @Put('/speaker/:id')
  updateSpeaker(@Param('id', ParseIntPipe) id: number, @Body() meetupSpeakerDto: CreateMeetupSpeakerDto,) {
    const userID = 1;
    return this.meetupsService.updateSpeaker(id, userID, meetupSpeakerDto);
  }
}
