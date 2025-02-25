// import mongoose, { Schema } from 'mongoose';
// import bcrypt from 'bcrypt';
// import { IAdmin } from '../../types/admin.types';

// const AdminSchema = new Schema({
//   username: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true
//   },
//   phone: {
//     type: String,
//     required: true
//   },
//   password: {
//     type: String,
//     required: true
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   }
// }, {
//   timestamps: true
// });

// AdminSchema.pre('save', async function(next) {
//   if (this.isModified('password')) {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//   }
//   next();
// });


// export const AdminModel = mongoose.model<IAdmin>('Admin', AdminSchema);


import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';


export interface IAdmin extends Document {
  username: string;
  email: string;
  phone: string;
  password: string;
  isActive: boolean;
  passwordResetToken?: string;  // Optional field for OTP
  resetTokenExpiry?: Date;      // Optional field for OTP expiry
}

const AdminSchema = new Schema<IAdmin>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  passwordResetToken: { type: String },
  resetTokenExpiry: { type: Date },
}, { timestamps: true });

// Hash password before saving
AdminSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

export const AdminModel = mongoose.model<IAdmin>('Admin', AdminSchema);
