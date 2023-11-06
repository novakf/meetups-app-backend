import { Module } from '@nestjs/common';
import { MeetupsController } from './meetups.controller';
import { MeetupsService } from './meetups.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Meetup } from './meetups.model';

@Module({
  controllers: [MeetupsController],
  providers: [MeetupsService],
  imports: [
    SequelizeModule.forFeature([Meetup])
  ]
})
export class MeetupsModule {}
