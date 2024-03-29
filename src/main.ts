import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { resolve } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const PORT = process.env.PORT;

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setBaseViewsDir(resolve('./src/views'));
  app.setViewEngine('pug');
  app.enableCors({
    credentials: true,
    origin: [
      'http://localhost:3000',
      'http://172.20.10.4:3000',
      'http://172.20.10.4:19006',
    ],
  });

  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('MeetupsApp')
    .setDescription('Документация API')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);

  await app.listen(3001, () => console.log(`Server started on port = ${PORT}`));
}

bootstrap();
