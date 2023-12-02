import {
  Column,
  DataType,
  HasMany,
  HasOne,
  Model,
  Table,
} from 'sequelize-typescript';
import { Meetup } from 'src/meetups/meetups.model';

interface UserCreateAttr {
  id: number;
  name: string;
  phone: string;
  email: string;
  avatarImg: string;
  isAdmin: boolean;
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

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isAdmin: boolean;

  @HasMany(() => Meetup)
  meetups: Meetup[];
}
