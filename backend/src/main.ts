import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggerMiddleware } from './middleware/logger.middleware';
const port = process.env.PORT || 4000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Habilita CORS
  app.useGlobalPipes(new ValidationPipe());
  app.use(new LoggerMiddleware().use); // Aplicar middleware globalmente

  await app.listen(port);
}
bootstrap();
