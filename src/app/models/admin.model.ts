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


// import mongoose, { Schema, Document, Types } from 'mongoose';
// import bcrypt from 'bcrypt';


// export interface IAdmin extends Document {
//    _id: Types.ObjectId;  // Ensure `_id` is properly typed
//   username: string;
//   email: string;
//   phone: string;
//   password: string;
//   isActive: boolean;
//   role: { type: String, default: "admin" },  // ✅ Ensure role exists
//   passwordResetToken?: string;  // Optional field for OTP
//   resetTokenExpiry?: Date;      // Optional field for OTP expiry

// }

// const AdminSchema = new Schema<IAdmin>({
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
//   },
 
//     // role: { type: String, default: "admin" },  // ✅ Ensure role exists

//   passwordResetToken: { type: String },
//   resetTokenExpiry: { type: Date },
// }, { timestamps: true });

// // Hash password before saving
// AdminSchema.pre('save', async function(next) {
//   if (this.isModified('password')) {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//   }
//   next();
// });

// export const AdminModel = mongoose.model<IAdmin>('Admin', AdminSchema);


import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IAdmin extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  phone?: string;  // Make phone optional if you don't need it
  image?: string;  // Add image field
  password: string;
  isActive: boolean;
  role: { type: String, default: "admin" };
  passwordResetToken?: string;
  resetTokenExpiry?: Date;
}

const AdminSchema = new Schema<IAdmin>({
  id: Types.ObjectId,
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  phone: {
    type: String,
    required: false,  // Make phone optional
  },
  image: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
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
