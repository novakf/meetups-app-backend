import { Body, Controller, Get, Req } from '@nestjs/common';
import { data } from '../meetups';
import { Render, Param, ParseIntPipe } from '@nestjs/common';
import { Request } from 'express';

@Controller('/meetups')
export class AppController {
  @Get('')
  @Render('MeetupsPage')
  getByStatus(@Req() request?: Request) {
    if (!request.query.title) {
      let meetups = data;
      return { meetups };
    }
    let filteredMeetups = [];
    let searchTitle = request.query.title.toString();
    data.forEach(
      (meetup) =>
        meetup.title.toLowerCase().includes(searchTitle.toLowerCase()) &&
        filteredMeetups.push(meetup),
    );
    let meetups = filteredMeetups;
    return { meetups, searchTitle };
  }

  @Get(':id')
  @Render('SingleMeetupPage')
  getById(@Param('id', ParseIntPipe) id: number) {
    return data.find((meetup) => meetup.id === id);
  }
}