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
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING, allowNull: false })
  phone: string;

  @Column({ type: DataType.STRING, allowNull: false })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'http://localhost:9000/meetups-app/speakers/default/defaultAvatar.jpg',
  })
  avatarImg: string;

  @Column({ type: DataType.STRING, allowNull: false, defaultValue: 'активный' })
  status: SpeakerStatusType;

  @Column({ type: DataType.STRING, allowNull: true })
  organization: string;

  @Column({ type: DataType.STRING, allowNull: false })
  description: string;

  @BelongsToMany(() => Meetup, () => MeetupsSpeakers)
  meetups: Meetup[];
}
