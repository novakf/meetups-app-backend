import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { SpeakerStatusType } from 'src/types';

interface SpeakerCreateAttr {
  id: number;
  status: SpeakerStatusType;
  name: string;
  organization: string;
  avatarImg: string;
  description: string;
}

@Table({ tableName: 'speakers' })
export class Speaker extends Model<Speaker, SpeakerCreateAttr> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  status: SpeakerStatusType;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING, allowNull: false })
  phone: string;

  @Column({ type: DataType.STRING, allowNull: false })
  email: string;

  @Column({ type: DataType.STRING, allowNull: true })
  avatarImg: string;
  
  @Column({ type: DataType.STRING, allowNull: true })
  organization: string;

  @Column({ type: DataType.STRING, allowNull: false })
  description: string;
}
