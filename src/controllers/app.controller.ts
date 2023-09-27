import { Body, Controller, Get, Post, Redirect, Req } from '@nestjs/common';
import { data } from '../meetups';
import { Render, Param, ParseIntPipe } from '@nestjs/common';
import { Request } from 'express';

@Controller()
export class AppController {
  @Get('')
  @Render('MainPage')
  getByStatus(@Req() request?: Request) {
    if (!request.query.title) {
      let meetups = data;
      return {meetups};
    }
    let filteredMeetups = [];
    let searchTitle = request.query.title.toString()
    data.forEach(
      (meetup) =>
        meetup.title.toLowerCase().includes(searchTitle.toLowerCase()) && filteredMeetups.push(meetup),
    );
    let meetups = filteredMeetups;
    return { meetups, searchTitle };
  }

  @Get(':id')
  @Render('SinglePage')
  getById(@Param('id', ParseIntPipe) id: number) {
    return data.find((meetup) => meetup.id === id);
  }

}
