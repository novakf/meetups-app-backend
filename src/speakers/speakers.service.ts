import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Speaker } from './speakers.model';
import { CreateSpeakerDto } from './dto/create-speaker.dto';
import { Op } from 'sequelize';
import { User } from 'src/users/users.model';

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

  async getByOrganization(org?: string) {
    const speakers = await this.speakerRepository.findAll({
      where: org && {
        organization: {
          [Op.iLike]: `%${org}%`,
        },
      },
      nest: true,
      raw: true,
      include: User,
    });

    return speakers;
  }

  async getById(id: number) {
    const speaker = await this.speakerRepository.findOne({
      where: { id },
      nest: true,
      raw: true,
      include: User,
    });
    return speaker;
  }
}
