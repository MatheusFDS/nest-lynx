import { PrismaClient } from '@prisma/client';

declare module 'express' {
  export interface Request {
    user?: {
      id: any;
      userId: number;
      email: string;
      role: string;
      tenantId: number;
    };
    prisma?: PrismaClient;
  }
}
