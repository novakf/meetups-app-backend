import { ApiProperty } from '@nestjs/swagger';
import {
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import { MeetupsSpeakers } from 'src/meetups/meetups-speakers.model';
import { Meetup } from 'src/meetups/meetups.model';
import { SpeakerStatusType } from 'src/types';

interface SpeakerCreateAttr {
  id: number;
  name: string;
  phone: string;
  email: string;
  avatarImg: string;
  status: SpeakerStatusType;
  organization: string;
  description: string;
}

@Table({ tableName: 'speakers', createdAt: false, updatedAt: false })
export class Speaker extends Model<Speaker, SpeakerCreateAttr> {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({ example: 'Иван Петров', description: 'Имя пользователя' })
  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @ApiProperty({
    example: '8(123)456-7890',
    description: 'Телефон пользователя',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  phone: string;

  @ApiProperty({
    example: 'name@example.com',
    description: 'Почта пользователя',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  email: string;

  @ApiProperty({
    example: 'http://localhost:9000/meetups-app/speakers/1/avatar.png',
    description: 'Фотография пользователя',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue:
      'http://localhost:9000/meetups-app/speakers/default/defaultAvatar.jpg',
  })
  avatarImg: string;

  @ApiProperty({
    example: 'активный',
    description: 'Статус (активный | удален)',
  })
  @Column({ type: DataType.STRING, allowNull: false, defaultValue: 'активный' })
  status: SpeakerStatusType;

  @ApiProperty({example: 'SberTech', description: 'Компания пользователя'})
  @Column({ type: DataType.STRING, allowNull: true })
  organization: string;

  @ApiProperty({example: 'Руководитель отдела', description: 'Описание'})
  @Column({ type: DataType.STRING, allowNull: true })
  description: string;

  @BelongsToMany(() => Meetup, () => MeetupsSpeakers)
  meetups: Meetup[];
}
