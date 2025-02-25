// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import { AdminModel } from "../../models/admin.model";
// import { JWTPayload } from "./auth.types";

// export const AuthService = {
//   authenticate: async (email: string, password: string) => {
//     // Look for the admin in the database
//     const admin = await AdminModel.findOne({ email });
    
//     // If admin does not exist or password is incorrect
//     if (!admin || !bcrypt.compareSync(password, admin.password)) {
//       throw new Error("Invalid credentials");
//     }
    
//     // If credentials are valid, generate the JWT token
//     const payload: JWTPayload = {
//       email, role: "admin",
//       userId: ""
//     };
//     const token = jwt.sign(
//       payload,
//       process.env.JWT_SECRET || "default_secret",
//       { expiresIn: "1d" }
//     );
    
//     return { token, role: payload.role, email: payload.email, id: admin._id };
//   },
// };

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AdminModel } from "../../models/admin.model";  // Admin Model
import { JWTPayload } from "./auth.types";  // JWT Payload Type
import { IAdmin } from "../../../types/admin.types";  // Import the IAdmin interface
import mongoose from "mongoose";  // For ObjectId handling

export const AuthService = {
  // 🟢 Authenticate the admin and return a JWT token
  authenticate: async (email: string, password: string) => {
    // Find admin by email and cast to IAdmin type
    const admin = await AdminModel.findOne({ email }) as IAdmin;  // Typecast to IAdmin

    // If admin does not exist or password is incorrect
    if (!admin) {
      console.log("Admin not found");
      throw new Error("Invalid credentials");
    }

    // Debugging logs for password comparison
    console.log("Entered password:", password);
    console.log("Stored hashed password:", admin.password);

    // Compare entered password with stored password using bcrypt
    const isPasswordValid = await bcrypt.compare(password.trim(), admin.password);  // Use trim() to ensure no extra spaces

    if (!isPasswordValid) {
      console.log("Invalid credentials - Password mismatch");
      throw new Error("Invalid credentials");
    }

    // If credentials are valid, generate the JWT token
    const payload: JWTPayload = {
      email,
      role: "admin",
      userId: admin._id.toString(),  // admin._id is now treated as IAdmin's ObjectId
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || "default_secret", {
      expiresIn: "1d",  // Token expiry time (adjust as needed)
    });

    return { token, role: payload.role, email: payload.email, id: admin._id.toString() };  // return _id as string
  },

  // 🟢 Find user by email (helper function to check credentials)
  findUserByEmail: async (email: string) => {
    const admin = await AdminModel.findOne({ email }) as IAdmin;  // Typecast to IAdmin type
    return admin;
  },

  // 🟢 Generate JWT Token for authenticated user
  generateAuthToken: async (admin: IAdmin) => {
    const payload: JWTPayload = {
      email: admin.email,
      role: "admin",
      userId: admin._id.toString(),
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || "default_secret", {
      expiresIn: "1d",
    });
    return token;
  },
};
