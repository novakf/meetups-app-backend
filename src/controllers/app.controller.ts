import { Controller, Get, Req } from '@nestjs/common';
import { Render, Param, ParseIntPipe } from '@nestjs/common';
import { Request } from 'express';
import { AppService } from 'src/services/app.service';

@Controller('/meetups')
export class AppController {
  constructor(private appService: AppService) {}

  @Get('')
  @Render('MeetupsPage')
  getByStatus(@Req() request: Request) {
    return this.appService.getByStatus(request)
  }

  @Get(':id')
  @Render('SingleMeetupPage')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.appService.getById(id)
  }
}