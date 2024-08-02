import { Request } from 'express';

declare module 'express' {
  export interface Request {
    user?: {
      id: any;
      userId: string;
      email: string;
      role: string;
      tenantId: string;
    };
  }
}
