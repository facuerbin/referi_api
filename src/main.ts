import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { config } from './config/config';
import * as basicAuth from 'express-basic-auth';

async function bootstrap() {
  Logger.log(`App starting in ${config.NODE_ENV} enviroment`);

  const app = await NestFactory.create(AppModule);
  app.enableCors();

  app.useGlobalPipes(new ValidationPipe());

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.use(
    ['/v1/docs'],
    basicAuth({
      challenge: true,
      users: {
        referiapp: config.API_DOC_PASS,
      },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Referí')
    .setDescription(
      'Descripción de la API Rest del Sistema de Gestión de Clubes, Referí.',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('v1/docs', app, document, {
    customSiteTitle: 'Referí API',
    customCss: '.topbar {display:none}',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
    },
  });

  await app.listen(3000);
}
bootstrap();
