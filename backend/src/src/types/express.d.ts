import { Request } from 'express';

declare module 'express' {
  export interface Request {
    user?: {
      userId: number;
      email: string;
      role: string;
      tenantId: number;
    };
  }
}
