// user.controller.ts 
import { Request, Response, NextFunction } from "express";
import UserModel from "../../models/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { emailHelper } from "../mailer/mailer";

export const UserController = {
  register: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username, email,phoneNumber,businessName, password } = req.body;

      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        res.status(400).json({ message: "User already exists" });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new UserModel({ username, email,phoneNumber,businessName, password: hashedPassword, confirmPassword: hashedPassword });

      await newUser.save();
      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      next(error); // Pass error to middleware
    }
  },

  login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      const user = await UserModel.findOne({ email });
      if (!user) {
        res.status(400).json({ message: "Invalid credentials" });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(400).json({ message: "Invalid credentials" });
        return;
      }

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "default_secret", {
        expiresIn: "1h",
      });

      res.status(200).json({ message: "Login successful" ,token, userId: user._id});
    } catch (error) {
      next(error); // Pass error to middleware
    }
  },

  forgotPassword: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
  
      // Find user by email
      const user = await UserModel.findOne({ email });
      if (!user) {
        res.status(404).json({ message: "User not found." });
        return;
      }
  
      // Generate OTP for the reset process
      const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
      const resetToken = crypto.randomBytes(32).toString("hex"); // For security, separate reset token
      const resetTokenExpiry = Date.now() + 3600000; // OTP expiry (1 hour)
  
      // Store OTP and expiry in the user model
      user.passwordResetToken = otp; // Store OTP in passwordResetToken
      user.resetTokenExpiry = new Date(resetTokenExpiry);
      user.passwordResetTokenForSecurity = resetToken; // Store reset token for security (if required)
      await user.save();
  
      // Send OTP to the user's email
      await emailHelper.sendEmail({
        to: email,
        subject: "Password Reset OTP",
        html: `Your OTP for password reset is ${otp}. It will expire in 1 hour.`,
      });
  
      res.status(200).json({ message: "OTP sent to email." });
    } catch (error) {
      console.error("Error in forgotPassword:", error);
      next(error);
    }
  },
  resetPassword: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, token, newPassword, confirmPassword } = req.body;
  
      // Validate new password and confirm password match
      if (newPassword !== confirmPassword) {
        res.status(400).json({ message: "Passwords do not match." });
        return;
      }
  
      // Find user by email
      const user = await UserModel.findOne({ email });
      if (!user) {
        res.status(404).json({ message: "User not found." });
        return;
      }
  
      // Check if OTP and token have expired
      if (!user.passwordResetToken || !user.resetTokenExpiry || user.resetTokenExpiry.getTime() < Date.now()) {
        res.status(400).json({ message: "OTP has expired or is invalid." });
        return;
      }
  
      // Validate OTP (compare with the OTP sent to user's email)
      if (token !== user.passwordResetToken) {
        res.status(400).json({ message: "Invalid OTP." });
        return;
      }
  
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Set the new password and clear the reset token
      user.password = hashedPassword;
      user.passwordResetToken = undefined; // Clear the OTP
      user.resetTokenExpiry = undefined; // Clear the expiry time
  
      // Save the updated user
      await user.save();
  
      res.status(200).json({ message: "Password reset successful." });
    } catch (error) {
      console.error("Error in resetPassword:", error);
      next(error);
    }
  },
  
  
// Get all users (accessible only to admin)
getTotalUsers: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Find all users and select their _id and email
    const users = await UserModel.find({}, "_id email");

    // Get the total number of users
    const totalUsers = users.length;

    res.json({
      totalUsers,
      users: users.map(user => ({
        id: user._id,    // Include user ID
        email: user.email
      })),  
    });
  } catch (error) {
    next(error); // Pass error to middleware
  }
},


searchUser: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email } = req.body; // Access email from query parameters
  if (!email) {
    res.status(400).json({ message: "Email is required" });
    return;
  }
  
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    next(error); // Pass error to middleware
  }
},


// Delete user (accessible only to admin)
deleteUser: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params; // User ID to delete
  try {
    const user = await UserModel.findById(id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    await user.deleteOne(); // Remove the user
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    next(error); // Pass error to middleware
  }
},


};


