// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import { AdminModel } from "../../models/admin.model";
// import { JWTPayload } from "./auth.types";

import { AdminModel, IAdmin } from "../../models/admin.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWTPayload } from "./auth.types";
import { Types } from "mongoose";
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

// import Types  from "mongoose";  // Import Types from mongoose

export const AuthService = {
  authenticate: async (email: string, password: string) => {
    // Find admin by email
    const admin = await AdminModel.findOne({ email }) as IAdmin;

    if (!admin) {
      console.log("❌ Admin not found");
      throw new Error("Invalid credentials");
    }

    console.log("🔹 Entered password:", password);
    console.log("🔹 Stored hashed password:", admin.password);

    // 🔴 FIX: Ensure password comparison works correctly
    if (!admin.password || typeof admin.password !== "string") {
      console.log("❌ Password field is missing or incorrect format");
      throw new Error("Invalid credentials");
    }

    // 🔴 FIX: Ensure bcrypt is comparing properly
    const isPasswordValid = await bcrypt.compare(password.trim(), admin.password);

    if (!isPasswordValid) {
      console.log("❌ Invalid credentials - Password mismatch");
      throw new Error("Invalid credentials");
    }
    const adminId = admin._id instanceof Types.ObjectId ? admin._id.toString() : String(admin._id);    // Generate JWT Token
    const payload: JWTPayload = {
      email,
      role: "admin",
      userId: adminId,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || "default_secret", {
      expiresIn: "1d",
    });

    return { token, role: payload.role, email: payload.email, id: adminId.toString() };
  },
};


