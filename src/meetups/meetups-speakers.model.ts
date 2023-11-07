import {
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Speaker } from 'src/speakers/speakers.model';
import { Meetup } from './meetups.model';

@Table({
  tableName: 'meetups_speakers',
  createdAt: false,
  updatedAt: false,
})
export class MeetupsSpeakers extends Model<MeetupsSpeakers> {
  @ForeignKey(() => Meetup)
  @Column({ type: DataType.INTEGER, primaryKey: true })
  meetupId: number;

  @ForeignKey(() => Speaker)
  @Column({ type: DataType.INTEGER, primaryKey: true })
  speakerId: number;
}
