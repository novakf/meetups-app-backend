import { Module } from '@nestjs/common';
import { SpeakersController } from './controllers/speaker.controller';
import { AppController } from './controllers/app.controller';

@Module({
  imports: [],
  controllers: [AppController, SpeakersController],
})
export class AppModule {}
