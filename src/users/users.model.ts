import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  DataType,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Meetup } from 'src/meetups/meetups.model';
import { UserRoleType } from 'src/types';

interface UserCreateAttr {
  id: number;
  name: string;
  phone?: string;
  email: string;
  password: string;
  avatarImg?: string;
  role: UserRoleType;
}

@Table({ tableName: 'users', createdAt: false, updatedAt: false })
export class User extends Model<User, UserCreateAttr> {
  @ApiProperty({ example: '1' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({ example: 'Иван Петров' })
  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @ApiProperty({ example: '8(123)456-7890', required: false })
  @Column({ type: DataType.STRING, allowNull: true })
  phone?: string;

  @ApiProperty({ example: 'name@example.com' })
  @Column({ type: DataType.STRING, allowNull: false })
  email: string;

  @ApiProperty({ example: 'password' })
  @Column({ type: DataType.STRING, allowNull: false })
  password: string;

  @ApiProperty({ required: false })
  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue:
      'http://localhost:9000/meetups-app/users/default/defaultAvatar.png',
  })
  avatarImg: string;

  @ApiProperty({ example: 'участник', required: false })
  @Column({ type: DataType.STRING, allowNull: false, defaultValue: 'участник' })
  role: UserRoleType;

  @HasMany(() => Meetup)
  meetups: Meetup[];
}
