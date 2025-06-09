import { Request } from 'express';

declare module 'express' {
  export interface Request {
    user?: {
      driverId: any;
      driverId: any;
      driverId: any;
      driverId: any;
      driverId: any;
      driverId: any;
      id: any;
      userId: string;
      email: string;
      role: string;
      tenantId: string;
    };
  }
}
