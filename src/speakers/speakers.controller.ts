import { Controller, Get, Param, ParseIntPipe, Render, Req } from '@nestjs/common';
import { SpeakersService } from './speakers.service';
import { Request } from 'express';
import { data } from '../speakers';

@Controller('speakers')
export class SpeakersController {
  constructor(private speakersService: SpeakersService) {}

  @Get('')
  @Render('SpeakersPage')
  async getByStatus(@Req() request?: Request) {
    let speakers = await this.speakersService.getAllSpeakers();
    if (!request.query.company) return { speakers };

    let filteredSpeakers = [];
    let company = request.query.company.toString();
    speakers.forEach(
      (speaker) =>
        speaker.organization?.toLowerCase().includes(company.toLowerCase()) &&
        filteredSpeakers.push(speaker),
    );
    speakers = filteredSpeakers;
    return { speakers, company };
  }

  @Get(':id')
  @Render('SingleSpeakerPage')
  async getById(@Param('id', ParseIntPipe) id: number) {
    let speakers = await this.speakersService.getAllSpeakers();
    return speakers.find((speaker) => speaker.id === id).dataValues;
  }
}
