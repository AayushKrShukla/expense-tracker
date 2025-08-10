import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Expense Tracker API')
    .setDescription('API Documentation for Expense Tracker')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('/api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      stopAtFirstError: false,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
