// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import { AdminModel } from "../../models/admin.model";
// import { JWTPayload } from "./auth.types";

import { AdminModel, IAdmin } from "../../models/admin.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWTPayload } from "./auth.types";
import mongoose, { Types } from "mongoose";

export const AuthService = {
  // authenticate: async (email: string, password: string) => {
  //   // Find admin by email
  //   const admin = await AdminModel.findOne({ email }) as IAdmin;

  //   if (!admin) {
  //     console.log("❌ Admin not found");
  //     throw new Error("Invalid credentials");
  //   }

  //   console.log("🔹 Entered password:", password);
  //   console.log("🔹 Stored hashed password:", admin.password);

  //   // 🔴 FIX: Ensure password comparison works correctly
  //   if (!admin.password || typeof admin.password !== "string") {
  //     console.log("❌ Password field is missing or incorrect format");
  //     throw new Error("Invalid credentials");
  //   }

  //   // 🔴 FIX: Ensure bcrypt is comparing properly
  //   const isPasswordValid = await bcrypt.compare(password.trim(), admin.password);

  //   if (!isPasswordValid) {
  //     console.log("❌ Invalid credentials - Password mismatch");
  //     throw new Error("Invalid credentials");
  //   }
  //   const adminId = admin._id instanceof Types.ObjectId ? admin._id.toString() : String(admin._id);    // Generate JWT Token
  //   const payload: JWTPayload = {
  //     email,
  //     role: "admin",
  //     userId: adminId,
  //   };

  //   const token = jwt.sign(payload, process.env.JWT_SECRET || "default_secret", {
  //     expiresIn: "1d",
  //   });

  //   return { token, role: payload.role, email: payload.email, id: adminId.toString() };
  // },
 
  authenticate: async (email: string, password: string) => {
    // Find admin by email and cast to IAdmin type
    const admin = await AdminModel.findOne({ email }) as IAdmin;  // Typecast to IAdmin

    // If admin does not exist or password is incorrect
    if (!admin) {
      console.log("❌ Admin not found");
      throw new Error("Invalid credentials");
    }

    console.log("🔹 Entered password:", password);
    console.log("🔹 Stored hashed password:", admin.password);

    // 🔴 FIX: Ensure password comparison works correctly
    const isPasswordValid = await bcrypt.compare(password.trim(), admin.password);

    if (!isPasswordValid) {
      console.log("❌ Invalid credentials - Password mismatch");
      throw new Error("Invalid credentials");
    }

    // Ensure admin._id is a valid ObjectId
    const adminId = admin._id instanceof mongoose.Types.ObjectId ? admin._id.toString() : String(admin._id);

    // Generate JWT Token
    const payload = {
      email,
      role: "admin",
      userId: adminId,  // admin._id as userId in token
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || "default_secret", {
      expiresIn: "1d",  // Token expiry time (adjust as needed)
    });

    return { token, role: payload.role, email: payload.email, id: adminId };  // return _id as string
  },

  // 🟢 Find user by email (helper function to check credentials)
  findUserByEmail: async (email: string) => {
    const admin = await AdminModel.findOne({ email }) as IAdmin;  // Typecast to IAdmin type
    return admin;
  },

  // 🟢 Generate JWT Token for authenticated user
  generateAuthToken: async (admin: IAdmin) => {
    const payload = {
      email: admin.email,
      role: "admin",
      userId: admin._id.toString(),  // Ensure it's a valid string ObjectId
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || "default_secret", {
      expiresIn: "1d",
    });
    return token;
  },
  
  changePassword: async (adminId: string, currentPassword: string, newPassword: string): Promise<boolean> => {
    // Find admin by ID
    const admin = await AdminModel.findById(adminId) as IAdmin;
    
    if (!admin) {
      throw new Error("Admin not found");
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword.trim(), admin.password);
    
    if (!isPasswordValid) {
      throw new Error("Current password is incorrect");
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword.trim(), salt);
    
    // Update password
    await AdminModel.findByIdAndUpdate(
      adminId,
      { $set: { password: hashedPassword } }
    );
    
    return true;
  },
};


