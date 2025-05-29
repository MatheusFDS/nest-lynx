// main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

const port = process.env.PORT || 4000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

const allowedOrigins = [
    'https://gerarota.vercel.app',
    'https://gerarota-matheusfds-projects.vercel.app',
    'https://gerarota-git-master-matheusfds-projects.vercel.app',
    'http://localhost:3000',
    'http://localhost:8081',
    'http://localhost:8081/',
    'http://localhost:8081/login',
    'exp://localhost:8081',
    'exp://192.168.1.100:8081',
    'http://192.168.1.100:8081',
    'capacitor://localhost',
    'ionic://localhost',
    'http://localhost',
    'http://127.0.0.1:8081',
    'exp://127.0.0.1:8081',
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
