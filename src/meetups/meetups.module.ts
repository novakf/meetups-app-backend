import { Module, forwardRef } from '@nestjs/common';
import { MeetupsController } from './meetups.controller';
import { MeetupsService } from './meetups.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Meetup } from './meetups.model';
import { Speaker } from 'src/speakers/speakers.model';
import { MeetupsSpeakers } from './meetups-speakers.model';
import { User } from 'src/users/users.model';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [MeetupsController],
  providers: [MeetupsService],
  imports: [
    forwardRef(() => AuthModule),
    SequelizeModule.forFeature([Meetup, Speaker, MeetupsSpeakers, User]),
  ],
  exports: [MeetupsService]
})
export class MeetupsModule {}
