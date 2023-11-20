import { Module } from '@nestjs/common';
import { SpeakersController } from './speakers.controller';
import { SpeakersService } from './speakers.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Speaker } from './speakers.model';
import { Meetup } from 'src/meetups/meetups.model';
import { MeetupsSpeakers } from 'src/meetups/meetups-speakers.model';
import { User } from 'src/users/users.model';
import { MinioService } from 'src/minio/minio.service';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [SpeakersController],
  providers: [SpeakersService, MinioService, ConfigService],
  imports: [
    SequelizeModule.forFeature([Speaker, Meetup, MeetupsSpeakers])
  ]
})
export class SpeakersModule {}
