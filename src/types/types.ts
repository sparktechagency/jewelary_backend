import mongoose, { Schema, Document } from "mongoose";
interface Error {
  stack?: string;
  statusCode?: number;
  message: string;
  status?: string;
}

