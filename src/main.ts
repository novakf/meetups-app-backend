import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { resolve } from 'path';

async function bootstrap() {
  const PORT = process.env.PORT;
  
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setBaseViewsDir(resolve('./src/views'));

  app.setViewEngine('pug');
  await app.listen(PORT, () => console.log(`Server started on port = ${PORT}`));
}

bootstrap();
