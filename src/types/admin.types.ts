import mongoose, { Document, ObjectId } from 'mongoose';



// export interface IAdmin extends Document {


//   username: string;
//   email: string;
//   phone: string;
//   password: string;
//   isActive: boolean;
//   passwordResetToken?: string;  // For OTP reset
//   resetTokenExpiry?: Date;      // For OTP expiry
//   _id: mongoose.Types.ObjectId;  // Explicitly define the type for _id
// }

import { Types } from "mongoose";

export interface IAdmin extends Document {
  _id: Types.ObjectId;  // Ensure `_id` is properly typed
  username: string;
  email: string;
  phone: string;
  password: string;
  isActive: boolean;
  passwordResetToken?: string;
  resetTokenExpiry?: Date;
}



export type AdminCreateDTO = {
  username: string;
  email: string;
  phone: string;
  password: string;
};

export type AdminUpdateDTO = Partial<{
  username: string;
  email: string;
  phone: string;
  password: string;
}>;

export type AdminResponse = Omit<IAdmin, 'password'> & {
  _id: string;
};


