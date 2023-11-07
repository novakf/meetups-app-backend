import {
  Column,
  DataType,
  HasMany,
  HasOne,
  Model,
  Table,
} from 'sequelize-typescript';
import { Meetup } from 'src/meetups/meetups.model';
import { Speaker } from 'src/speakers/speakers.model';

interface UserCreateAttr {
  id: number;
  name: string;
  phone: string;
  email: string;
  avatarImg: string;
}

@Table({ tableName: 'users', createdAt: false, updatedAt: false })
export class User extends Model<User, UserCreateAttr> {
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

  @Column({ type: DataType.STRING, allowNull: true })
  avatarImg: string;

  @HasOne(() => Speaker)
  speaker: Speaker

  @HasMany(() => Meetup)
  meetups: Meetup[];
}
