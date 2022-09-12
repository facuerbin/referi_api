import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { config } from './config/config';

async function bootstrap() {
  Logger.log(`App starting in ${config.NODE_ENV} enviroment`);

  const app = await NestFactory.create(AppModule);
  app.enableCors();

  app.useGlobalPipes(new ValidationPipe());

  app.enableVersioning({
    type: VersioningType.URI,
  });

  const swaggerConfig = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Referí')
    .setDescription(
      'Descripción de la API Rest del Sistema de Gestión de Clubes, Referí.',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('v1', app, document);

  await app.listen(3000);
}
bootstrap();
