import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Speaker } from './speakers.model';
import { CreateSpeakerDto } from './dto/create-speaker.dto';
import { Op, QueryTypes, Sequelize } from 'sequelize';
import { User } from 'src/users/users.model';
import { MeetupsSpeakers } from 'src/meetups/meetups-speakers.model';
import { Meetup } from 'src/meetups/meetups.model';

@Injectable()
export class SpeakersService {
  constructor(
    @InjectModel(Speaker) private speakerRepository: typeof Speaker,
    @InjectModel(MeetupsSpeakers)
    private meetupsSpeakersRepository: typeof MeetupsSpeakers,
    @InjectModel(Meetup) private meetupRepository: typeof Meetup,
  ) {}

  async createSpeaker(dto: CreateSpeakerDto, fileName?: string) {
    const speaker = await this.speakerRepository.create(dto);
    if (fileName)
      await speaker.update({
        avatarImg: `http://localhost:9000/meetups-app/speakers/${speaker.id}/${fileName}`,
      });
    return speaker;
  }

  async uploadAvatar(id: number, fileName: string) {
    const result = await this.speakerRepository.update(
      {
        avatarImg: `http://localhost:9000/meetups-app/speakers/${id}/${fileName}`,
      },
      {
        where: {
          id: id,
        },
      },
    );
    return this.speakerRepository.findOne({
      where: {
        id: id,
      },
    });
  }

  async getByOrganization(userID?: number, org?: string) {
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
      order: ['id'],
      attributes: { exclude: ['userID'] },
    });

    const meetup =
      userID &&
      (await this.meetupRepository.findAll({
        where: {
          creatorID: userID,
          status: 'черновик',
        },
        include: [
          Speaker,
          { model: User, as: 'creatorInfo', attributes: [] },
          {
            model: User,
            as: 'moderatorInfo',
            attributes: [],
          },
        ],
        attributes: {
          include: [
            [Sequelize.literal('"creatorInfo"."email"'), 'creatorLogin'],
            [Sequelize.literal('"moderatorInfo"."email"'), 'moderatorLogin'],
          ],
          exclude: ['creatorID', 'moderatorID'],
        },
      }));

    return { meetup: meetup ? meetup[0] : null, speakers };
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

  async deleteSpeaker(userID: number, id: number) {
    const result = await this.speakerRepository.destroy({
      where: {
        id: id,
      },
    });

    if (result === 0)
      throw new HttpException('Спикер не найден', HttpStatus.NOT_FOUND);
    //return `Не удалось удалить спикера с id=${id} / спикер с id=${id} не найден`;

    return this.getByOrganization(userID);
  }

  async addSpeakerToMeetup(id: number, userID: number) {
    let meetup = await this.meetupRepository.findOne({
      where: {
        creatorID: userID,
        status: 'черновик',
      },
    });

    if (!meetup)
      meetup = await this.meetupRepository.create({
        creatorID: userID,
        status: 'черновик',
      });

    const currentRecord = await this.meetupsSpeakersRepository.findOne({
      where: {
        meetupId: meetup.id,
        speakerId: id,
      },
    });

    if (currentRecord)
      throw new HttpException(
        'Спикер уже добавлен в заявку',
        HttpStatus.BAD_REQUEST,
      );

    await this.meetupsSpeakersRepository.create({
      meetupId: meetup.id,
      speakerId: id,
    });

    const resultMeetup = await this.meetupRepository.findOne({
      where: {
        id: meetup.id,
      },
      include: [
        Speaker,
        { model: User, as: 'creatorInfo', attributes: [] },
        {
          model: User,
          as: 'moderatorInfo',
          attributes: [],
        },
      ],
      attributes: {
        include: [
          [Sequelize.literal('"creatorInfo"."email"'), 'creatorLogin'],
          [Sequelize.literal('"moderatorInfo"."email"'), 'moderatorLogin'],
        ],
        exclude: ['creatorID', 'moderatorID'],
      },
    });

    return resultMeetup;
  }

  async updateSpeaker(
    userID: number,
    id: number,
    dto: CreateSpeakerDto,
    fileName?: string,
  ) {
    const result = await this.speakerRepository.update(dto, {
      where: {
        id: id,
      },
    });

    if (fileName)
      await this.speakerRepository.update(
        {
          avatarImg: `http://localhost:9000/meetups-app/speakers/${id}/${fileName}`,
        },
        {
          where: {
            id: id,
          },
        },
      );

    return this.getById(id);
  }

  async changeStatus(id: number) {
    const speaker = await this.speakerRepository.sequelize.query(
      "UPDATE speakers SET status = CASE WHEN status = 'неактивный' THEN 'активный' ELSE 'неактивный' END WHERE id = $1",
      { type: QueryTypes.SELECT, bind: [id] },
    );

    return speaker;
  }
}
