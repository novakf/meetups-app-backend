import { Body, Controller, Get, Post, Redirect, Req } from '@nestjs/common';
import { data } from '../speakers';
import { Render, Param, ParseIntPipe } from '@nestjs/common';
import { Request } from 'express';

@Controller('/speakers')
export class SpeakersController {
  @Get('')
  @Render('SpeakersPage')
  getByStatus(@Req() request?: Request) {
    if (!request.query.company) {
      let speakers = data;
      return { speakers };
    }
    let filteredSpeakers = [];
    let company = request.query.company.toString();
    data.forEach(
      (speaker) =>
        speaker.organization?.toLowerCase().includes(company.toLowerCase()) &&
        filteredSpeakers.push(speaker),
    );
    let speakers = filteredSpeakers;
    return { speakers, company };
  }

  @Get(':id')
  @Render('SingleSpeakerPage')
  getById(@Param('id', ParseIntPipe) id: number) {
    return data.find((speaker) => speaker.id === id);
  }
}
