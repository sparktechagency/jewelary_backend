// import { Request, Response } from "express";
// import { AuthService } from "./auth.service";

// export const AuthController = {
//   login: async (req: Request, res: Response) => {
//     const { email, password } = req.body;
//     try {
//       const result = await AuthService.authenticate(email, password);
//       res.status(200).json(result);
//       console.log(result)
//     } catch (error) {
//       // Safely handle the `error` type
//       const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
//       res.status(401).json({ error: errorMessage });
//     }
//   },
// };


import { NextFunction, Request, Response } from "express";
import { AuthService } from "./auth.service";  // Your authentication service
import { AdminModel, IAdmin } from "../../models/admin.model";
import bcrypt from 'bcrypt';
import mongoose from "mongoose";


export const AuthController = {
  login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body;
    try {
      // Authenticate admin and get the JWT token
      const result = await AuthService.authenticate(email, password);

      // Return JWT token and other user details
      res.status(200).json({
        message: "Login successful",
        token: result.token,
        role: result.role,
        email: result.email,
        id: result.id,  // Admin ID returned from AuthService
      });
    } catch (error) {
      // Error handling for invalid credentials
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      res.status(401).json({ error: errorMessage });
    }
  },
  
  updateAdminProfile: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, username, currentPassword, newPassword, confirmPassword } = req.body;
    const adminId = req.user?.id; // Get admin ID from authenticated user
    
    try {
      // Validate inputs
      if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
        res.status(400).json({ error: "Invalid admin ID" });
        return;
      }

      // Find the admin by ID
      const admin = await AdminModel.findById(adminId) as IAdmin;
      if (!admin) {
        res.status(404).json({ error: "Admin not found" });
        return;
      }

      // Initialize update object with fields that don't require password verification
      const updates: Partial<IAdmin> = {};
      
      // Check if email or username is being updated
      if (email && email !== admin.email) {
        // Check if email already exists for another admin
        const emailExists = await AdminModel.findOne({ email, _id: { $ne: adminId } });
        if (emailExists) {
          res.status(400).json({ error: "Email already in use" });
          return;
        }
        updates.email = email;
      }
      
      if (username && username !== admin.username) {
        updates.username = username;
      }

      // If password change is requested
      if (currentPassword && newPassword && confirmPassword) {
        // Verify passwords match
        if (newPassword !== confirmPassword) {
          res.status(400).json({ error: "New passwords do not match" });
          return;
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(
          currentPassword.trim(), 
          admin.password
        );

        if (!isCurrentPasswordValid) {
          res.status(401).json({ error: "Current password is incorrect" });
          return;
        }

        // Password complexity validation (optional)
        if (newPassword.length < 8) {
          res.status(400).json({ error: "New password must be at least 8 characters long" });
          return;
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword.trim(), salt);
        updates.password = hashedPassword;
      }

      // Update admin if there are changes
      if (Object.keys(updates).length === 0) {
        res.status(400).json({ error: "No changes to update" });
        return;
      }

      // Apply updates and return updated admin
      const updatedAdmin = await AdminModel.findByIdAndUpdate(
        adminId,
        { $set: updates },
        { new: true, select: '-password' } // Return updated document without password
      );

      res.status(200).json({
        message: "Admin profile updated successfully",
        admin: {
          id: updatedAdmin?._id,
          email: updatedAdmin?.email,
          username: updatedAdmin?.username,
          role: updatedAdmin?.role || 'admin'
        }
      });
    } catch (error) {
      console.error("Admin update error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      res.status(500).json({ error: errorMessage });
    }
  },
  changePassword: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const adminId = req.user?.id; // Get admin ID from authenticated user
    
    try {
      // Validate inputs
      if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
        res.status(400).json({ error: "Invalid admin ID" });
        return;
      }

      // Check if all required fields are provided
      if (!currentPassword || !newPassword || !confirmPassword) {
        res.status(400).json({ error: "All password fields are required" });
        return;
      }

      // Verify passwords match
      if (newPassword !== confirmPassword) {
        res.status(400).json({ error: "New passwords do not match" });
        return;
      }

      // Find the admin by ID
      const admin = await AdminModel.findById(adminId) as IAdmin;
      if (!admin) {
        res.status(404).json({ error: "Admin not found" });
        return;
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword.trim(), 
        admin.password
      );

      if (!isCurrentPasswordValid) {
        res.status(401).json({ error: "Current password is incorrect" });
        return;
      }

      // Password complexity validation
      if (newPassword.length < 8) {
        res.status(400).json({ error: "New password must be at least 8 characters long" });
        return;
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword.trim(), salt);

      // Update admin's password
      await AdminModel.findByIdAndUpdate(
        adminId,
        { $set: { password: hashedPassword } }
      );

      res.status(200).json({
        message: "Password changed successfully"
      });
    } catch (error) {
      console.error("Password change error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      res.status(500).json({ error: errorMessage });
    }
  }

};