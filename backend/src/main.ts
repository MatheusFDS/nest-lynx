import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggerMiddleware } from './middleware/logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Habilita CORS
  app.useGlobalPipes(new ValidationPipe());
  app.use(new LoggerMiddleware().use); // Aplicar middleware globalmente

  await app.listen(4000);
}
bootstrap();
