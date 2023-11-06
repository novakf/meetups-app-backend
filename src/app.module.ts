import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MeetupsModule } from './meetups/meetups.module';
import { ConfigModule } from '@nestjs/config';
import { Meetup } from './meetups/meetups.model';
import { SpeakersModule } from './speakers/speakers.module';
import { Speaker } from './speakers/speakers.model';

@Module({
  controllers: [],
  providers: [],
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    SequelizeModule.forRoot({
      define: {
        timestamps: false,
      },
      dialect: 'postgres',
      host: process.env.POSGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASS,
      database: process.env.POSTGRES_DBNAME,
      models: [Meetup, Speaker],
      autoLoadModels: true,
    }),
    MeetupsModule,
    SpeakersModule,
  ],
})
export class AppModule {}
