import { Module } from '@nestjs/common';
import { SpeakersController } from './speakers.controller';
import { SpeakersService } from './speakers.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Speaker } from './speakers.model';

@Module({
  controllers: [SpeakersController],
  providers: [SpeakersService],
  imports: [
    SequelizeModule.forFeature([Speaker])
  ]
})
export class SpeakersModule {}
