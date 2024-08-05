import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createLogger, transports, format } from 'winston';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger;

  constructor() {
    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.printf(({ timestamp, level, message }) => {
          return `${timestamp} ${level}: ${message}`;
        }),
      ),
      transports: [
        new transports.File({ filename: 'combined.log' }), // Log file
      ],
    });
  }

  use = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user ? req.user.email : 'guest'; // Ajuste isso conforme a estrutura do seu usuário
    const logMessage = `User: ${user} | Method: ${req.method} | URL: ${req.originalUrl} | IP: ${req.ip}`;

    this.logger.info(logMessage);
    next();
  }
}
