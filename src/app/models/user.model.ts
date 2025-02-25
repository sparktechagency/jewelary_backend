// import mongoose, { Schema, Document } from "mongoose";

// // Define CartItem interface for items in the cart
// interface CartItem {
//   productId: mongoose.Types.ObjectId;
//   quantity: number;
// }

// // Extending IUser interface for cart functionality
// export interface IUser extends Document {  // Export the IUser interface
//   username: string;
//   email: string;
//   phoneNumber: string;
//   businessName: string;
//   location: string | null; // location can be null, not unique
//   password: string;
//   confirmPassword: string;
//   passwordResetToken?: string;
//   resetTokenExpiry?: Date;
//   passwordResetTokenForSecurity?: string;
//   cart: CartItem[];
//   role: 'user' | 'admin';
//   profileImage?: string;
// }

// // Define the schema for the user model
// const UserSchema = new Schema<IUser>({
//   username: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   phoneNumber: { type: String, unique: true },
//   businessName: { type: String, unique: true },
//   location: { type: String, default: null },
//   password: { type: String, required: true },
//   confirmPassword: { type: String, required: true },
//   passwordResetToken: { type: String },
//   resetTokenExpiry: { type: Date },
//   cart: [
//     {
//       productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
//       quantity: { type: Number, required: true, min: 1 },
//     },
//   ],
//   role: { type: String, required: true, enum: ['user', 'admin'], default: 'user' },
//   profileImage: { type: String },
// });

// // Create the User model from the schema
// const UserModel = mongoose.model<IUser>("User", UserSchema);

// // Export the model
// export default UserModel;
import mongoose, { Schema, Document } from "mongoose";

interface CartItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
}


interface CartItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
}

export interface IUser extends Document {
  username: string;
  email: string;
  phoneNumber: string;
  businessName: string;
  location: string | null;
  password: string;
  confirmPassword: string;
  passwordResetToken?: string;
  resetTokenExpiry?: Date;
  passwordResetTokenForSecurity?: string;
  cart: CartItem[];
  role: "user" | "admin";
  profileImage: string;  // Updated to a simple string type
  active: boolean;
}


const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, unique: true },
    businessName: { type: String, unique: true },
    location: { type: String, default: null },
    password: { type: String, required: true },
    confirmPassword: { type: String, required: true },
    passwordResetToken: { type: String },
    resetTokenExpiry: { type: Date },
    cart: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    role: { type: String, required: true, enum: ["user", "admin"], default: "user" },
    profileImage: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const UserModel = mongoose.model<IUser>("User", UserSchema);
export default UserModel;

