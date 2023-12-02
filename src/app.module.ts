import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MeetupsModule } from './meetups/meetups.module';
import { ConfigModule } from '@nestjs/config';
import { Meetup } from './meetups/meetups.model';
import { SpeakersModule } from './speakers/speakers.module';
import { Speaker } from './speakers/speakers.model';
import { MeetupsSpeakers } from './meetups/meetups-speakers.model';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';
import { User } from './users/users.model';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASS,
      database: process.env.POSTGRES_DBNAME,
      models: [Meetup, Speaker, MeetupsSpeakers, User],
      autoLoadModels: true,
    }),
    MeetupsModule,
    SpeakersModule,
    UsersModule,
  ],
})
export class AppModule {}
