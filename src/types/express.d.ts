// src/types/express.d.ts
import { Request } from 'express';

// declare global {
//   namespace Express {
//     interface Request {
//       user?: any; // You can type this more specifically depending on your use case
//     }
//   }
// }

declare module 'express' {
  export interface Request {
    user?: {
      id: string;
      role?: string;
    };
  }
}
