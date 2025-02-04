import mongoose, { Schema, Document } from "mongoose";

// types.ts
interface IAdminProfile extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  address: string;
  image?: string;
  updatedAt: Date;
  createdAt: Date;
}

