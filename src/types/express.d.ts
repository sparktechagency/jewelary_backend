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
