import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AdminModel } from "../../models/admin.model";
import { JWTPayload } from "./auth.types";

export const AuthService = {
  authenticate: async (username: string, password: string) => {
    // Look for the admin in the database
    const admin = await AdminModel.findOne({ username });
    
    // If admin does not exist or password is incorrect
    if (!admin || !bcrypt.compareSync(password, admin.password)) {
      throw new Error("Invalid credentials");
    }
    
    // If credentials are valid, generate the JWT token
    const payload: JWTPayload = {
      username, role: "admin",
      userId: ""
    };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "1d" }
    );
    
    return { token, role: payload.role, username: payload.username, id: admin._id };
  },
};
