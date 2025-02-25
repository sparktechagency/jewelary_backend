import { NextFunction, Request, Response } from 'express';
import { AdminService } from './admin.service';
import { AdminCreateDTO, AdminUpdateDTO } from '../../../types/admin.types';
import { AdminModel } from '../../models/admin.model';
import jwt from "jsonwebtoken";  // Make sure to import jsonwebtoken
import bcrypt from "bcrypt";
import { emailHelper } from '../mailer/mailer';
export class AdminController {
  static async createAdmin(req: Request, res: Response) {
    try {
      const adminData: AdminCreateDTO = {
        username: req.body.username,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password
      };

      const admin = await AdminService.createAdmin(adminData);
      res.status(201).json('Admin created successfully');
    } catch (error: any) {
      res.status(400).json({ 
        error: error.message || 'Failed to create admin'
      });
    }
  };

  static async updateAdmin(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const updateData: AdminUpdateDTO = {};

      if (req.body.username) updateData.username = req.body.username;
      if (req.body.email) updateData.email = req.body.email;
      if (req.body.phone) updateData.phone = req.body.phone;
      if (req.body.password) updateData.password = req.body.password;

      const admin = await AdminService.updateAdmin(id, updateData);
      res.json(admin);
    } catch (error: any) {
      res.status(400).json({ 
        error: error.message || 'Failed to update admin'
      });
    }
  };
  //get all admins
  static async getAdmins(req: Request, res: Response) {
    try {
      const admins = await AdminService.getAdmins();
      res.json(admins);
    } catch (error: any) {
      res.status(400).json({ 
        error: error.message || 'Failed to fetch admins'
      });
    }
  };
   //delete admin
    static async deleteAdmin(req: Request, res: Response) {
      try {
        const id = req.params.id;
        AdminService.deleteAdmin(id);
        res.json('Admin deleted successfully');
      } catch (error: any) {
        res.status(400).json({ 
          error: error.message || 'Failed to delete admin'
        });
      };
    };

      // // 🟢 Reset Admin Password
      // static async resetAdminPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
      //   try {
      //     // Get token from headers
      //     const token = req.headers.authorization?.split(" ")[1];  // Extract token from "Bearer <token>"
      //     if (!token) {
      //        res.status(401).json({ message: "Unauthorized: No token provided." });
      //        return
      //     }
    
      //     // Verify JWT token and extract admin ID
      //     const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
      //     const adminId = decoded.adminId;
    
      //     // Find admin by ID
      //     const admin = await AdminModel.findById(adminId);
      //     if (!admin) {
      //        res.status(404).json({ message: "Admin not found." });
      //        return
      //     }
    
      //     const { newPassword, confirmPassword } = req.body;
    
      //     // Validate password fields
      //     if (!newPassword || !confirmPassword) {
      //        res.status(400).json({ message: "Both newPassword and confirmPassword are required." });
      //        return
      //     }
    
      //     if (newPassword !== confirmPassword) {
      //        res.status(400).json({ message: "Passwords do not match." });
      //        return
      //     }
    
      //     // Hash the new password
      //     const hashedPassword = await bcrypt.hash(newPassword, 10);
    
      //     // Update the admin's password
      //     admin.password = hashedPassword;
      //     await admin.save();
    
      //     res.status(200).json({ message: "Password reset successful." });
      //   } catch (error: any) {
      //     console.error("Error in resetAdminPassword:", error);
      //     res.status(401).json({ message: "Invalid or expired token." });
      //     next(error);
      //   }
      // }
    
      // // 🟢 Change Admin Password
      // static async changeAdminPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
      //   try {
      //     const adminId = (req.user as { id: string }).id;  // Extract admin ID from token
      //     const { currentPassword, newPassword, confirmPassword } = req.body;
    
      //     // Validate input fields
      //     if (!currentPassword || !newPassword || !confirmPassword) {
      //        res.status(400).json({ message: "All fields are required." });
      //        return
      //     }
    
      //     // Find admin in the database
      //     const admin = await AdminModel.findById(adminId);
      //     if (!admin) {
      //        res.status(404).json({ message: "Admin not found." });
      //        return
      //     }
    
      //     // Check if current password is correct
      //     const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
      //     if (!isPasswordValid) {
      //        res.status(400).json({ message: "Current password is incorrect." });
      //        return
      //     }
    
      //     // Check if new passwords match
      //     if (newPassword !== confirmPassword) {
      //        res.status(400).json({ message: "New password and confirm password do not match." });
      //        return
      //       }
    
      //     // Hash new password and update admin record
      //     admin.password = await bcrypt.hash(newPassword, 10);
      //     await admin.save();
    
      //     res.status(200).json({ message: "Password changed successfully." });
      //   } catch (error) {
      //     next(error);
      //   }
      // }

    
        
        // 🟢 Request Admin Password Reset (Send OTP)
        static async requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
          try {
            const { email } = req.body;
      
            // Find admin by email
            const admin = await AdminModel.findOne({ email });
            if (!admin) {
             res.status(404).json({ message: "Admin not found." });
             return
            }
      
            // Generate 6-digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
            // Set OTP expiry (1 hour from now)
            const otpExpiry = new Date();
            otpExpiry.setHours(otpExpiry.getHours() + 1);
      
            // Store OTP and expiry in the admin document
            admin.passwordResetToken = otp;
            admin.resetTokenExpiry = otpExpiry;
            await admin.save();
      
            // Send OTP via email
            await emailHelper.sendEmail({
              to: admin.email,
              subject: "Password Reset OTP",
              html: `<p>Your OTP for resetting your password is <strong>${otp}</strong>.</p>
                     <p>This OTP will expire in 1 hour.</p>`
            });
      
            res.status(200).json({ message: "OTP sent to your email address." });
          } catch (error) {
            console.error("Error in sending OTP:", error);
            next(error);
          }
        }
      

          // 🟢 Verify OTP and Reset Admin Password
          static async verifyOtpAndResetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
            try {
              const { email, otp, newPassword, confirmPassword } = req.body;
        
              // Find admin by email
              const admin = await AdminModel.findOne({ email });
              if (!admin) {
                 res.status(404).json({ message: "Admin not found." });
                 return
              }
        
              // Check if the OTP is correct
              if (admin.passwordResetToken !== otp) {
                 res.status(400).json({ message: "Invalid OTP." });
                 return
              }
        
              // Check if OTP has expired
              if (!admin.resetTokenExpiry || new Date() > admin.resetTokenExpiry) {
                 res.status(400).json({ message: "OTP has expired." });
                 return
              }
        
              // Validate password fields
              if (!newPassword || !confirmPassword) {
                 res.status(400).json({ message: "Both newPassword and confirmPassword are required." });
                 return
              }
        
              if (newPassword !== confirmPassword) {
                 res.status(400).json({ message: "Passwords do not match." });
                 return
              }
        
              // Hash the new password
              const hashedPassword = await bcrypt.hash(newPassword, 10);
        
              // Update the admin's password
              admin.password = hashedPassword;
              admin.passwordResetToken = undefined;  // Clear the OTP
              admin.resetTokenExpiry = undefined;   // Clear the expiry time
              await admin.save();
        
              res.status(200).json({ message: "Password reset successful." });
            } catch (error) {
              console.error("Error in resetting password:", error);
              next(error);
            }
          }
        
        
        
        
        // 🟢 Change Admin Password (Authenticate Current Password)
        static async changeAdminPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
          try {
            const adminId = (req.user as { id: string }).id;  // Extract admin ID from token
            const { currentPassword, newPassword, confirmPassword } = req.body;
      
            // Validate input fields
            if (!currentPassword || !newPassword || !confirmPassword) {
               res.status(400).json({ message: "All fields are required." });
               return
              }
      
            // Find admin in the database
            const admin = await AdminModel.findById(adminId);
            if (!admin) {
               res.status(404).json({ message: "Admin not found." });
               return
              }
      
            // Check if current password is correct
            const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
            if (!isPasswordValid) {
               res.status(400).json({ message: "Current password is incorrect." });
               return
              }
      
            // Check if new passwords match
            if (newPassword !== confirmPassword) {
               res.status(400).json({ message: "New password and confirm password do not match." });
               return
              }
      
            // Hash new password and update admin record
            admin.password = await bcrypt.hash(newPassword, 10);
            await admin.save();
      
            res.status(200).json({ message: "Password changed successfully." });
          } catch (error) {
            next(error);
          }
        }
      }
      
  


