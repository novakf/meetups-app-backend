import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Speaker } from './speakers.model';
import { CreateSpeakerDto } from './dto/create-speaker-dto';

@Injectable()
export class SpeakersService {
  constructor(
    @InjectModel(Speaker) private speakerRepository: typeof Speaker,
  ) {}

  async createSpeaker(dto: CreateSpeakerDto) {
    const speaker = await this.speakerRepository.create(dto);
    return speaker;
  }

  async getAllSpeakers() {
    const speakers = await this.speakerRepository.findAll();
    return speakers;
  }
}
