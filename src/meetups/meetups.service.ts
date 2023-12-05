import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Meetup } from './meetups.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateMeetupDto } from './dto/create-meetup.dto';
import { Speaker } from 'src/speakers/speakers.model';
import { Op } from 'sequelize';
import { MeetupStatusType } from 'src/types';
import { Sequelize } from 'sequelize-typescript';
import { MeetupsSpeakers } from './meetups-speakers.model';
import { CreateMeetupSpeakerDto } from './dto/create-meetup-speaker.dto';
import sequelize from 'sequelize';
import { User } from 'src/users/users.model';

@Injectable()
export class MeetupsService {
  constructor(
    @InjectModel(Meetup) private meetupRepository: typeof Meetup,
    @InjectModel(MeetupsSpeakers)
    private meetupsSpeakersRepository: typeof MeetupsSpeakers,
  ) {}

  async createMeetup(dto: CreateMeetupDto) {
    const meetup = await this.meetupRepository.create(dto);
    return meetup;
  }

  async getAllMeetups(status?: string, startDate?: string, endDate?: string) {
    const meetups = await this.meetupRepository.findAll({
      where:
        status && !(startDate && endDate)
          ? {
              [Op.not]: { status: 'черновик' || 'отменен' },
              status: status,
            }
          : startDate && endDate && !status
          ? {
              [Op.not]: { status: 'черновик' || 'отменен' },
              [Op.and]: [
                sequelize.where(
                  sequelize.fn('date', sequelize.col('createdAt')),
                  '>=',
                  startDate,
                ),
                sequelize.where(
                  sequelize.fn('date', sequelize.col('createdAt')),
                  '<=',
                  endDate,
                ),
              ],
            }
          : status && startDate && endDate
          ? {
              status: status,
              [Op.not]: { status: 'черновик' || 'отменен' },
              [Op.and]: [
                sequelize.where(
                  sequelize.fn('date', sequelize.col('createdAt')),
                  '>=',
                  startDate,
                ),
                sequelize.where(
                  sequelize.fn('date', sequelize.col('createdAt')),
                  '<=',
                  endDate,
                ),
              ],
            }
          : {
              [Op.not]: { status: 'черновик' || 'отменен' },
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

    return meetups;
  }

  async getById(id: number) {
    const meetup = await this.meetupRepository.findOne({
      where: {
        id: id,
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

    if (!meetup)
      throw new HttpException('Митап не найден', HttpStatus.NOT_FOUND);

    return meetup;
  }

  async updateMeetup(userID: number, dto: CreateMeetupDto) {
    const result = await this.meetupRepository.update(
      { ...dto, updatedAt: Sequelize.literal('CURRENT_TIMESTAMP') },
      {
        where: {
          creatorID: userID,
          status: 'черновик',
        },
      },
    );

    if (result[0] === 0)
      throw new HttpException(
        'Ошибка обновления информации',
        HttpStatus.BAD_REQUEST,
      );

    const currentMeetup = await this.meetupRepository.findAll({
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
    });

    if (!currentMeetup)
      throw new HttpException('Черновик не найден', HttpStatus.NOT_FOUND);

    //return result[0] === 1 ? `Информация о митапе с id=${id} изменена` : `Не удалось изменить информацию о митапе с id=${id}`;

    return currentMeetup[0];
  }

  async completeMeetupByCreator(userID: number) {
    const currentMeetup = await this.meetupRepository.findOne({
      where: {
        creatorID: userID,
        status: 'черновик',
      },
    });

    const meetupsSpeakers = await this.meetupsSpeakersRepository.findAll({
      where: {
        meetupId: currentMeetup.id,
      },
    });

    let condition = meetupsSpeakers.every((record) => {
      if (
        !record.startsAt ||
        !record.endsAt ||
        !record.reportTheme ||
        !record.reportDescription
      )
        return false;

      return true;
    });

    if (!currentMeetup)
      throw new HttpException('Черновик не найден', HttpStatus.NOT_FOUND);

    if (
      !currentMeetup.title ||
      !currentMeetup.date ||
      !currentMeetup.description
    )
      throw new HttpException(
        'Заполните все поля заявки на митап прежде чем формировать ее',
        HttpStatus.FORBIDDEN,
      );

    if (!condition)
      throw new HttpException(
        'Заполните все поля спикера',
        HttpStatus.FORBIDDEN,
      );

    const meetup = await this.meetupRepository.update(
      {
        status: 'сформирован',
      },
      {
        where: {
          creatorID: userID,
          status: 'черновик',
        },
      },
    );

    if (!meetup)
      throw new HttpException(
        'Не удалось сформировать заявку',
        HttpStatus.BAD_REQUEST,
      );

    return this.meetupRepository.findOne({
      where: {
        id: currentMeetup.id,
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
  }

  async completeMeetupByModerator(
    id: number,
    userID: number,
    decision: MeetupStatusType,
  ) {
    const currentMeetup = await this.meetupRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!currentMeetup)
      throw new HttpException(
        'Заявка на митап не найдена',
        HttpStatus.NOT_FOUND,
      );

    if (
      currentMeetup.status === 'завершен' ||
      currentMeetup.status === 'отклонен'
    )
      throw new HttpException(
        'Заявка уже обработана модератором',
        HttpStatus.FORBIDDEN,
      );

    if (currentMeetup.status !== 'сформирован')
      throw new HttpException(
        'Заявка еще не сформирована создателем',
        HttpStatus.FORBIDDEN,
      );

    if (decision !== 'завершен' && decision !== 'отклонен') {
      throw new HttpException(
        'Невозможно указать введенный статус',
        HttpStatus.FORBIDDEN,
      );
    }

    const meetup = await this.meetupRepository.update(
      {
        status: decision,
        moderatorID: userID,
        confirmedAt: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      {
        where: {
          id: id,
        },
      },
    );

    return this.meetupRepository.findOne({
      where: {
        id: id,
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
  }

  async deleteMeetup(id: number) {
    const result = await this.meetupRepository.destroy({
      where: {
        id: id,
      },
    });

    if (result === 0)
      throw new HttpException('Митап не найден', HttpStatus.NOT_FOUND);

    return this.meetupRepository.findAll({
      where: {
        [Op.not]: { status: 'черновик' || 'отменен' },
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
  }

  async deleteSpeakerFromMeetup(id: number, userID: number) {
    const meetup = await this.meetupRepository.findOne({
      where: {
        creatorID: userID,
        status: 'черновик',
      },
    });

    if (!meetup)
      throw new HttpException('Черновик не найден', HttpStatus.NOT_FOUND);

    const result = await this.meetupsSpeakersRepository.destroy({
      where: {
        speakerId: id,
        meetupId: meetup.id,
      },
    });

    if (result === 0)
      throw new HttpException(
        'Не удалось удалить спикера из заявки на митап',
        HttpStatus.BAD_REQUEST,
      );

    const resultMeetup = await this.meetupRepository.findAll({
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
    });
    return resultMeetup[0];
  }

  async updateSpeaker(id: number, userID: number, dto: CreateMeetupSpeakerDto) {
    const meetup = await this.meetupRepository.findOne({
      where: {
        creatorID: userID,
        status: 'черновик',
      },
    });

    if (!meetup)
      throw new HttpException('Черновик не найден', HttpStatus.NOT_FOUND);

    const currentRecord = await this.meetupsSpeakersRepository.findOne({
      where: {
        speakerId: id,
        meetupId: meetup.id,
      },
    });

    if (!currentRecord)
      throw new HttpException(
        'Указанный спикер не добавлен в заявку',
        HttpStatus.NOT_FOUND,
      );

    const result = await this.meetupsSpeakersRepository.update(dto, {
      where: {
        speakerId: id,
        meetupId: meetup.id,
      },
    });

    return this.meetupRepository.findOne({
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
  }
}
