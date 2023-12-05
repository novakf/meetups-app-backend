import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { resolve } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const PORT = process.env.PORT;

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setBaseViewsDir(resolve('./src/views'));
  app.setViewEngine('pug');

  const config = new DocumentBuilder()
    .setTitle('MeetupsApp')
    .setDescription('Документация API')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);


  await app.listen(PORT, () => console.log(`Server started on port = ${PORT}`));
}

bootstrap();
