import mongoose, { Schema, Document } from "mongoose";
interface Error {
  stack?: string;
  statusCode?: number;
  message: string;
  status?: string;
}

// In your types file
export interface AuthRequest extends Request {
  user?: {
    id: string;
    role?: string;
    email?: string;
  };
}