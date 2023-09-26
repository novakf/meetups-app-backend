import { Body, Controller, Get, Post, Redirect, Req } from '@nestjs/common';
import { data } from '../meetups';
import { Render, Param, ParseIntPipe } from '@nestjs/common';
import { Request } from 'express';

@Controller()
export class AppController {
  @Get()
  @Render('MainPage')
  index() {
    let meetups = data;
    return { meetups };
  }

  @Get('/find')
  @Render('MainPage')
  getByStatus(@Req() request: Request) {
    let filteredMeetups = [];
    data.forEach(
      (meetup) =>
        meetup.status === request.query.status && filteredMeetups.push(meetup),
    );
    let meetups = filteredMeetups;
    return { meetups };
  }

  @Get('create')
  @Render('CreateMeetup')
  getForm(): void {
    return;
  }

  @Get(':id')
  @Render('SinglePage')
  getById(@Param('id', ParseIntPipe) id: number) {
    return data.find((meetup) => meetup.id === id);
  }

  @Post('meetups')
  @Redirect('/')
  create(@Body() body: any): void {
    const id = data.length + 1;
    body[id] = id;
    data.push(body);
  }
}
