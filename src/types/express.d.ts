// declare module 'express' {
//   export interface Request {
//     user?: {
//       id: string;
//       role?: string;
//     };
//   }
// }
// src/types/express.d.ts


import { Request } from "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: { id: string; role?: string };
  }
}

interface AuthRequest extends Request {
  user?: {
    id: string;
    role?: string;
  };
}
import jwt from 'jsonwebtoken';
