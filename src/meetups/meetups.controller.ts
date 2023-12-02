import { Body, Controller, Get, Post, Render } from '@nestjs/common';
import { MeetupsService } from './meetups.service';
import { CreateMeetupDto } from './dto/create-meetup.dto';

@Controller('meetups')
export class MeetupsController {
  constructor(private meetupsService: MeetupsService) {}

  @Post()
  create(@Body() meetupDto: CreateMeetupDto) {
    return this.meetupsService.createMeetup(meetupDto);
  }

  @Get()
  @Render('MeetupsPage')
  getAll() {
    return this.meetupsService.getAllMeetups();
  }
}
