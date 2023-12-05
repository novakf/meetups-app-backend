import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Speaker } from 'src/speakers/speakers.model';
import { MeetupStatusType } from 'src/types';
import { MeetupsSpeakers } from './meetups-speakers.model';
import { User } from 'src/users/users.model';
import { ApiProperty } from '@nestjs/swagger';

interface MeetupCreationAttrs {
  id: number;
  creatorID: number;
  moderatorID: number;
  status: MeetupStatusType;
  date: string;
  place: string;
  title: string;
  description: string;
  preview: string;
  updatedAt: string;
  confirmedAt: string;
}

@Table({ tableName: 'meetups', updatedAt: false })
export class Meetup extends Model<Meetup, MeetupCreationAttrs> {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  creatorID: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  moderatorID: number;

  @ApiProperty({ example: 'черновик', description: 'Статус заявки' })
  @Column({ type: DataType.STRING, allowNull: false })
  status: MeetupStatusType;

  @ApiProperty({ example: '2023-11-29', description: 'Дата проведения' })
  @Column({ type: DataType.STRING, allowNull: true })
  date: string;

  @ApiProperty({ example: 'Библиотека', description: 'Место проведения' })
  @Column({ type: DataType.STRING, allowNull: true })
  place: string;

  @ApiProperty({ example: 'AI cars', description: 'Заголовок' })
  @Column({ type: DataType.STRING, allowNull: true })
  title: string;

  @ApiProperty({
    example: 'Встреча «ИИ для автономной мобильности»',
    description: 'Описание',
  })
  @Column({ type: DataType.STRING, allowNull: true })
  description: string;

  @ApiProperty({
    example: 'http://localhost:9000/meetups-app/meetups/1/preview.png',
    description: 'Превью мероприятия',
  })
  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue:
      'http://localhost:9000/meetups-app/meetups/default/defaultPreview.png',
  })
  preview: string;

  @ApiProperty({
    example: '2023-12-04 18:03:54.897113 +00:00',
    description: 'Дата обновления заявки',
  })
  @Column({ type: DataType.DATE, allowNull: true })
  updatedAt: string;

  @ApiProperty({
    example: '2023-12-04 18:03:54.897113 +00:00',
    description: 'Дата подтверждения заявки',
  })
  @Column({ type: DataType.DATE, allowNull: true })
  confirmedAt: string;

  @ApiProperty({ example: 'creatorLogin', description: 'Логин пользователя' })
  creatorLogin: string;

  @ApiProperty({ example: 'moderatorLogin', description: 'Логин модератора' })
  moderatorLogin: string;

  @BelongsTo(() => User, { foreignKey: 'creatorID', as: 'creatorInfo' })
  creator: User;

  @BelongsTo(() => User, { foreignKey: 'moderatorID', as: 'moderatorInfo' })
  moderator: User;

  @ApiProperty({ description: 'Спикеры, входящие в митап', type: [Speaker] })
  @BelongsToMany(() => Speaker, () => MeetupsSpeakers)
  speakers: Speaker[];
}
