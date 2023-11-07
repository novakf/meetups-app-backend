import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Speaker } from 'src/speakers/speakers.model';
import { Meetup } from 'src/meetups/meetups.model';
import { User } from './users.model';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [SequelizeModule.forFeature([Speaker, Meetup, User])],
})
export class UsersModule {}
