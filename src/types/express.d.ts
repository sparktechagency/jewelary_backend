import { Request } from "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      _id: any; 
      id: string;
       role?: string;
      

};
  }
}

interface AuthRequest extends Request {
  user?: {
    id:any;
    id: string;
    role?: string;
  };
}
import jwt from 'jsonwebtoken';

interface Request {
  user?: { 
    id: string; 
    _id: string;
    role?: string;
     email?: string };
}

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      _id: any; id: string; role?: string
      id: string;
      role?: string; // You can add any other properties your user object might have
      email?: string; // Example additional field
    };
  }
}

interface Variation {
  color: string;
  size: string;
  thickness: string;
  quantity: number;
  price: number;
  colorName: string;
  colorValue: string;
}
