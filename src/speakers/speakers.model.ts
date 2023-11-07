import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { MeetupsSpeakers } from 'src/meetups/meetups-speakers.model';
import { Meetup } from 'src/meetups/meetups.model';
import { SpeakerStatusType } from 'src/types';
import { User } from 'src/users/users.model';

interface SpeakerCreateAttr {
  id: number;
  status: SpeakerStatusType;
  organization: string;
  description: string;
}

@Table({ tableName: 'speakers', createdAt: false, updatedAt: false })
export class Speaker extends Model<Speaker, SpeakerCreateAttr> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false, unique: true })
  userID: number;

  @Column({ type: DataType.STRING, allowNull: false })
  status: SpeakerStatusType;

  @Column({ type: DataType.STRING, allowNull: true })
  organization: string;

  @Column({ type: DataType.STRING, allowNull: false })
  description: string;

  @BelongsTo(() => User, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  user: User;

  @BelongsToMany(() => Meetup, () => MeetupsSpeakers)
  meetups: Meetup[];
}
