import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Speaker } from './speakers.model';
import { CreateSpeakerDto } from './dto/create-speaker.dto';
import { Op, QueryTypes } from 'sequelize';
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

  async getByOrganization(org?: string) {
    const speakers = await this.speakerRepository.findAll({
      where: org
        ? {
            organization: {
              [Op.iLike]: `%${org}%`,
            },
            status: 'активный',
          }
        : {
            status: 'активный',
          },
      nest: true,
      raw: true,
      order: ['id'],
      attributes: { exclude: ['userID'] },
    });

    return speakers;
  }

  async getById(id: number) {
    const speaker = await this.speakerRepository.findOne({
      where: { id },
      nest: true,
      raw: true,
      attributes: { exclude: ['userID'] },
    });
    return speaker;
  }

  async changeStatus(id: number) {
    const speaker = await this.speakerRepository.sequelize.query(
      "UPDATE speakers SET status = CASE WHEN status = 'неактивный' THEN 'активный' ELSE 'неактивный' END WHERE id = $1",
      { type: QueryTypes.SELECT, bind: [id] },
    );

    return speaker;
  }
}
