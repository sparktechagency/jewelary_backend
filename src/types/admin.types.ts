import { Document } from 'mongoose';

export interface IAdmin extends Document {
  username: string;
  email: string;
  phone: string;
  password: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
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


