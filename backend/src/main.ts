// main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

const port = process.env.PORT || 4000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Definição das origens permitidas
  const allowedOrigins = [
    'https://gerarota.vercel.app',
    'https://gerarota-matheusfds-projects.vercel.app',
    'https://gerarota-git-master-matheusfds-projects.vercel.app',
    'http://localhost:3000', // Ajuste a porta conforme necessário
  ];

  const corsOptions: CorsOptions = {
    origin: function (origin, callback) {
      // Permite requisições sem origin (como mobile apps ou CURL)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Origin não autorizada pelo CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Habilita envio de cookies e autenticação
    allowedHeaders: 'Content-Type, Authorization', // Headers permitidos
  };

  // Aplicar configuração de CORS
  app.enableCors(corsOptions);

  // Configuração global de pipes e middleware
  app.useGlobalPipes(new ValidationPipe());
  app.use(new LoggerMiddleware().use); // Aplicar middleware globalmente

  await app.listen(port);
  console.log(`Servidor rodando na porta ${port}`);
}

bootstrap();
