import { NextFunction, Request, Response } from 'express';
import { AdminService } from './admin.service';
import { AdminCreateDTO, AdminUpdateDTO } from '../../../types/admin.types';
import { AdminModel } from '../../models/admin.model';
import jwt from "jsonwebtoken";  // Make sure to import jsonwebtoken
import bcrypt from "bcrypt";
import { emailHelper } from '../mailer/mailer';
export class AdminController {
  static async createAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const adminData = {
        username: req.body.username,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password,
        role: "admin",  // ✅ Ensure role is assigned
      };

      const admin = await AdminService.createAdmin(adminData);
      res.status(201).json({ message: "Admin created successfully", adminId: admin._id });
    } catch (error) {
      next(error);  // ✅ Proper error handling
    }
  }

  // ✅ Login Admin with Role
  // static async login(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const { email, password } = req.body;
  
  //     const admin = await AdminModel.findOne({ email });
  //     if (!admin) {
  //       return res.status(400).json({ message: "Invalid credentials" });
  //     }
  
  //     // Compare password
  //     const isPasswordValid = await bcrypt.compare(password, admin.password);
  //     if (!isPasswordValid) {
  //       return res.status(400).json({ message: "Invalid credentials" });
  //     }
  
  //     // Check if account is active
  //     if (!admin.isActive) {
  //       return res.status(403).json({ message: "Your account is deactivated. Please contact support." });
  //     }

  //     // ✅ Include Role in JWT Token
  //     const token = jwt.sign(
  //       { userId: admin._id, role: admin.role }, 
  //       process.env.JWT_SECRET || "default_secret", 
  //       { expiresIn: "1h" }
  //     );
  
  //     res.status(200).json({
  //       message: "Login successful",
  //       token,
  //       userId: admin._id,
  //       user: admin.username,
  //       role: admin.role,  // ✅ Return role in response
  //     });

  //   } catch (error) {
  //     next(error);  // ✅ Proper error handling
  //   }
  // }

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


 static  async forgotPassword (req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
          const { email } = req.body;
      
          // Find user by email
          const admin = await AdminModel.findOne({ email });
          if (!admin) {
            res.status(404).json({ message: "admin not found." });
            return;
          }
      
          // Generate OTP & reset token
          const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
          const resetTokenExpiry = Date.now() + 3600000; // OTP expiry (1 hour)
      
          // Store OTP and expiry in the user model
          admin.passwordResetToken = otp;
          admin.resetTokenExpiry = new Date(resetTokenExpiry);
          await admin.save();
      
          // Generate JWT token (assuming you have a user object that has the ID)
          const jwtToken = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET as string, {
            expiresIn: '1h', // or any time you prefer
          });
      
          // Console log the token
          console.log("JWT Token for admin:", jwtToken); // Log the token to the console
      
          // Send OTP via email
          await emailHelper.sendEmail({
            to: email,
            subject: "Password Reset OTP",
            html: `Your OTP for password reset is <b>${otp}</b>. It will expire in 1 hour.`,
          });
      
          res.status(200).json({ message: "OTP sent to email.", otp, jwtToken, }); // Optionally return the token
        } catch (error) {
          next(error);
        }
      }
        

        static async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
          try {
              // Get token from headers
              const token = req.headers.authorization?.split(" ")[1]; // Extract token from "Bearer <token>"
              if (!token) {
                  res.status(401).json({ message: "Unauthorized: No token provided." });
                  return;
              }
      
              // Verify JWT token and extract user ID
              const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
              const adminId = decoded.adminId;
      
              // Find user by ID
              const admin = await AdminModel.findById(adminId);
              if (!admin) {
                  res.status(404).json({ message: "admin not found." });
                  return;
              }
      
              const { otp } = req.body;
      
              // Validate OTP
              if (!otp) {
                  res.status(400).json({ message: "OTP is required." });
                  return;
              }
      
              // Check if OTP is valid and not expired
              if (!admin.passwordResetToken || !admin.resetTokenExpiry || admin.resetTokenExpiry.getTime() < Date.now()) {
                  res.status(400).json({ message: "OTP has expired or is invalid." });
                  return;
              }
      
              if (otp !== admin.passwordResetToken) {
                  res.status(400).json({ message: "Invalid OTP." });
                  return;
              }
      
              // If OTP is valid, clear it from the database
              admin.passwordResetToken = undefined;
              admin.resetTokenExpiry = undefined;
              await admin.save();
      
              res.status(200).json({ message: "OTP verified successfully." });
          } catch (error) {
              console.error("Error in verifyOtp:", error);
              res.status(401).json({ message: "Invalid or expired token." });
              next(error);
          }
      }

   static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
          // Get token from headers
          const token = req.headers.authorization?.split(" ")[1]; // Extract token from "Bearer <token>"
          if (!token) {
            res.status(401).json({ message: "Unauthorized: No token provided." });
            return;
          }
    
          // Verify JWT token and extract user ID
          const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
          const adminId = decoded.adminId;
    
          // Find user by ID
          const admin = await AdminModel.findById(adminId);
          if (!admin) {
            res.status(404).json({ message: "admin not found." });
            return;
          }
    
          const { newPassword, confirmPassword } = req.body;
    
          // Validate password fields
          if (!newPassword || !confirmPassword) {
            res.status(400).json({ message: "Both newPassword and confirmPassword are required." });
            return;
          }
    
          if (newPassword !== confirmPassword) {
            res.status(400).json({ message: "Passwords do not match." });
            return;
          }
    
          // Hash the new password
          const hashedPassword = await bcrypt.hash(newPassword, 10);
    
          // Update the password
          admin.password = hashedPassword;
          await admin.save();
    
          res.status(200).json({ message: "Password reset successful." });
        } catch (error) {
          console.error("Error in resetPassword:", error);
          res.status(401).json({ message: "Invalid or expired token." });
          next(error);
        }
    }

   static async changePassword (req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const adminId = (req.user as { id: string }).id; // Extract user ID from token
        const { currentPassword, newPassword, confirmPassword } = req.body;
    
        // Validate input fields
        if (!currentPassword || !newPassword || !confirmPassword) {
          res.status(400).json({ message: "All fields are required." });
          return;
        }
    
        // Find user in the database
        const admin = await AdminModel.findById(adminId);
        if (!admin) {
          res.status(404).json({ message: "admin not found." });
          return;
        }
    
        // Check if current password is correct
        const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
        if (!isPasswordValid) {
          res.status(400).json({ message: "Current password is incorrect." });
          return;
        }
    
        // Check if new passwords match
        if (newPassword !== confirmPassword) {
          res.status(400).json({ message: "New password and confirm password do not match." });
          return;
        }
    
        // Hash new password and update user record
        admin.password = await bcrypt.hash(newPassword, 10);
        await admin.save();
    
        res.status(200).json({ message: "Password changed successfully." });
      } catch (error) {
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
      
  


function next(error: unknown) {
  throw new Error('Function not implemented.');
}

