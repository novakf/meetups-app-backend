import { Injectable } from '@nestjs/common';
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
                  sequelize.fn('date', sequelize.col('date')),
                  '>=',
                  startDate,
                ),
                sequelize.where(
                  sequelize.fn('date', sequelize.col('date')),
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
                  sequelize.fn('date', sequelize.col('date')),
                  '>=',
                  startDate,
                ),
                sequelize.where(
                  sequelize.fn('date', sequelize.col('date')),
                  '<=',
                  endDate,
                ),
              ],
            }
          : {
              [Op.not]: { status: 'черновик' || 'отменен' },
            },
      include: {
        model: Speaker,
        through: {
          attributes: [],
        },
      },
    });

    return meetups;
  }

  async getById(id: number) {
    const meetup = await this.meetupRepository.findOne({
      where: {
        id: id,
      },
      include: {
        model: Speaker,
        through: {
          attributes: [],
        },
      },
    });

    if (!meetup) return 'Митап не найден';
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

    const currentMeetup = await this.meetupRepository.findOne({
      where: {
        creatorID: userID,
        status: 'черновик',
      },
    });

    //return result[0] === 1 ? `Информация о митапе с id=${id} изменена` : `Не удалось изменить информацию о митапе с id=${id}`;

    return currentMeetup;
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

    if (!currentMeetup) return 'Черновик не найден';

    if (
      !currentMeetup.title ||
      !currentMeetup.date ||
      !currentMeetup.description ||
      !currentMeetup.preview
    )
      return 'Заполните все поля заявки на митап прежде чем формировать ее';

    if (!condition) return 'Заполните все поля спикера';

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

    if (!meetup) return 'Не удалось сформировать заявку';

    return this.meetupRepository.findOne({
      where: {
        id: currentMeetup.id,
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

    if (!currentMeetup) return 'Заявка на митап не найдена';

    if (
      currentMeetup.status === 'завершен' ||
      currentMeetup.status === 'отклонен'
    )
      return 'Заявка уже обработана модератором';

    if (currentMeetup.status !== 'сформирован')
      return 'Заявка еще не сформирована создателем';

    if (decision !== 'завершен' && decision !== 'отклонен') {
      return 'Невозможно указать введенный статус';
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
    });
  }

  async deleteMeetup(id: number) {
    const result = await this.meetupRepository.destroy({
      where: {
        id: id,
      },
    });

    if (result === 0)
      return `Не удалось удалить митап с id=${id} / митап с id=${id} не найден`;

    return this.meetupRepository.findAll({
      where: {
        [Op.not]: { status: 'черновик' || 'отменен' },
      },
      include: {
        model: Speaker,
        through: {
          attributes: [],
        },
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

    if (!meetup) return 'Черновик не найден';

    const result = await this.meetupsSpeakersRepository.destroy({
      where: {
        speakerId: id,
        meetupId: meetup.id,
      },
    });

    if (result === 0) return 'Не удалось удалить спикера из заявки на митап';

    return this.meetupRepository.findOne({
      where: {
        creatorID: userID,
        status: 'черновик',
      },
      include: {
        model: Speaker,
        through: {
          attributes: [],
        },
      },
    });
  }

  async updateSpeaker(id: number, userID: number, dto: CreateMeetupSpeakerDto) {
    const meetup = await this.meetupRepository.findOne({
      where: {
        creatorID: userID,
        status: 'черновик',
      },
    });

    if (!meetup) return 'Черновик не найден';

    const currentRecord = await this.meetupsSpeakersRepository.findOne({
      where: {
        speakerId: id,
        meetupId: meetup.id,
      },
    });

    if (!currentRecord) return 'Указанный спикер не добавлен в заявку';

    const result = await this.meetupsSpeakersRepository.update(dto, {
      where: {
        speakerId: id,
        meetupId: meetup.id,
      },
    });

    return this.meetupsSpeakersRepository.findAll({
      where: {
        meetupId: meetup.id,
      },
    });
  }
}
