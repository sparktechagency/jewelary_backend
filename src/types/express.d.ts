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

interface Request {
  user?: { id: string; role?: string; email?: string };
}

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: string;
      role?: string; // You can add any other properties your user object might have
      email?: string; // Example additional field
    };
  }
}