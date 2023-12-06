import { ApiProperty } from '@nestjs/swagger';
import { Meetup } from './meetups/meetups.model';
import { DataType } from 'sequelize-typescript';

export type MeetupStatusType =
  | 'черновик'
  | 'удален'
  | 'сформирован'
  | 'завершен'
  | 'отклонен';

export type SpeakerStatusType = 'активный' | 'удален';

export type UserRoleType = 'участник' | 'организатор' | 'модератор';

export type MeetupsType = {
  id: number;
  status: string;
  date?: string;
  place?: string;
  title?: string;
  description?: string;
  preview?: string;
  updatedAt?: string;
  confirmedAt?: string;
  createdAt: string;
  creatorLogin?: string;
  moderatorLogin?: string;
  speakers?: SpeakerType[];
  MeetupsSpeakers?: MeetupsSpeakersType[];
};

export type SpeakerType = {
  id: number;
  name: string;
  phone: string;
  email: string;
  avatarImg?: string;
  status: SpeakerStatusType;
  organization?: string;
  description: string;
};

export type MeetupsSpeakersType = {
  meetupId: number;
  speakerId: number;
  startsAt?: string;
  endsAt?: string;
  reportTheme?: string;
  reportDescription?: string;
};

export class NotFoundStatusType {
  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({ example: 'Не найден' })
  message: string;
}

export class BadRequestStatusType {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Плохой запрос' })
  message: string;
}

export class UnauthorizedStatusType {
  @ApiProperty({ example: 401 })
  statusCode: number;

  @ApiProperty({ example: 'Неавторизован' })
  message: string;
}

export class ForbiddenStatusType {
  @ApiProperty({ example: 403 })
  statusCode: number;

  @ApiProperty({ example: 'Запрещено' })
  message: string;
}

export class SpeakersResponseType {
  @ApiProperty({ type: Meetup })
  meetup: MeetupsType | null;
}

export class SpeakerCreateBody {
  @ApiProperty({ example: 'Иван Петров' })
  name: string;

  @ApiProperty({ example: '8(123)456-7890' })
  phone: string;

  @ApiProperty({ example: 'name@example.com' })
  email: string;

  @ApiProperty({ example: 'Разработчик' })
  description: string;
}

export class SpeakerUpdateBody {
  @ApiProperty({ example: 'VK', required: false })
  organization?: string;
}

export class GetMeetupsQuery {
  @ApiProperty({ example: 'отклонен', required: false })
  status?: MeetupStatusType;

  @ApiProperty({
    example: '2023-12-30',
    type: DataType.DATE,
    required: false
  })
  endDate?: string;

  @ApiProperty({
    example: '2023-10-04',
    type: DataType.DATE,
    required: false
  })
  startDate?: string;
}

export class MeetupUpdateBody {
  @ApiProperty({ example: 'AI Cars', required: false })
  title?: string;

  @ApiProperty({
    example: '2023-12-04 18:03:54.897113 +00:00',
    type: DataType.DATE,
    required: false,
  })
  date?: string;

  @ApiProperty({ example: 'УЛК', required: false })
  place?: string;

  @ApiProperty({
    example: 'Встреча «ИИ для автономной мобильности»',
    required: false,
  })
  description?: string;
}

export class MeetupSpeakerUpdateBody {
  @ApiProperty({
    example: '2023-12-04 18:03:54.897113 +00:00',
    type: DataType.DATE,
    required: false,
  })
  startsAt?: string;

  @ApiProperty({
    example: '2023-12-04 19:03:54.897113 +00:00',
    type: DataType.DATE,
    required: false,
  })
  endsAt?: string;

  @ApiProperty({ example: 'Ai в машинах', required: false })
  reportTheme?: string;

  @ApiProperty({
    example: 'Об использовании исскуственного интеллекта в автомобилях',
    required: false,
  })
  reportDescription?: string;
}

export class LoginUserType {
  @ApiProperty({ example: 'name@example.com' })
  email: string;

  @ApiProperty({ example: 'password' })
  password: string;
}
