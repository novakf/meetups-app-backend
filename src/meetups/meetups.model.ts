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

  @Column({ type: DataType.STRING, allowNull: false })
  status: MeetupStatusType;

  @Column({ type: DataType.STRING, allowNull: true })
  date: string;

  @Column({ type: DataType.STRING, allowNull: true })
  place: string;

  @Column({ type: DataType.STRING, allowNull: true })
  title: string;

  @Column({ type: DataType.STRING, allowNull: true })
  description: string;

  @Column({ type: DataType.STRING, allowNull: true })
  preview: string;

  @Column({ type: DataType.DATE, allowNull: true })
  updatedAt: string;

  @Column({ type: DataType.DATE, allowNull: true })
  confirmedAt: string;

  @BelongsTo(() => User)
  user: User;

  @BelongsToMany(() => Speaker, () => MeetupsSpeakers)
  speakers: Speaker[];
}
