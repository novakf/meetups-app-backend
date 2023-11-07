import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Render,
  Req,
} from '@nestjs/common';
import { SpeakersService } from './speakers.service';
import { Request } from 'express';

@Controller('speakers')
export class SpeakersController {
  constructor(private speakersService: SpeakersService) {}

  @Get('')
  @Render('SpeakersPage')
  async getByStatus(@Req() request?: Request) {
    let company = request.query.company?.toString();

    let speakers = await this.speakersService.getByOrganization(company);

    return { speakers, company };
  }

  @Get(':id')
  @Render('SingleSpeakerPage')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.speakersService.getById(id);
  }
}
