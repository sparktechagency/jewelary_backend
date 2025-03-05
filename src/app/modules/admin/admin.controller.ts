import { Request, Response, NextFunction } from 'express';
import { AdminModel, IAdmin } from '../../models/admin.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export const AdminController = {
  // Create a new admin
  createAdmin: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username, email, password, confirmPassword, phone } = req.body;

      // Basic validation
      if (!username || !email || !password || !confirmPassword) {
        res.status(400).json({ 
          success: false, 
          message: 'All fields are required (username, email, password, confirmPassword)' 
        });
        return;
      }

      // Validate password confirmation
      if (password !== confirmPassword) {
        res.status(400).json({ 
          success: false, 
          message: 'Passwords do not match' 
        });
        return;
      }

      // Check if email already exists
      const existingEmail = await AdminModel.findOne({ email });
      if (existingEmail) {
        res.status(400).json({ 
          success: false, 
          message: 'Email already in use' 
        });
        return;
      }

      // Check if username already exists
      const existingUsername = await AdminModel.findOne({ username });
      if (existingUsername) {
        res.status(400).json({ 
          success: false, 
          message: 'Username already in use' 
        });
        return;
      }

      // Create new admin (password hashing is handled by pre-save hook in the model)
      const newAdmin = new AdminModel({
        username,
        email,
        password,
        phone: phone || undefined,  // Only add if provided
        isActive: true,
        role: 'admin'
      });

      await newAdmin.save();

      // Generate JWT token for immediate login
      const payload = {
        userId: newAdmin._id.toString(),
        email: newAdmin.email,
        role: 'admin'
      };

      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '1d' }
      );

      // Return success with admin details (excluding password)
      res.status(201).json({
        success: true,
        message: 'Admin created successfully',
        data: {
          id: newAdmin._id,
          username: newAdmin.username,
          email: newAdmin.email,
          role: newAdmin.role,
          token
        }
      });
    } catch (error) {
      console.error('Admin creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ 
        success: false, 
        message: errorMessage 
      });
    }
  },

  // Admin login
  login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        res.status(400).json({ 
          success: false, 
          message: 'Email and password are required' 
        });
        return;
      }

      // Find admin by email
      const admin = await AdminModel.findOne({ email });
      if (!admin) {
        res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
        return;
      }

      // Check if admin is active
      if (!admin.isActive) {
        res.status(403).json({ 
          success: false, 
          message: 'Account is disabled. Please contact support.' 
        });
        return;
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password.trim(), admin.password);
      if (!isPasswordValid) {
        res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
        return;
      }

      // Generate JWT token
      const payload = {
        userId: admin._id.toString(),
        email: admin.email,
        role: 'admin'
      };

      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '1d' }
      );

      // Return success with token and admin details
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ 
        success: false, 
        message: errorMessage 
      });
    }
  },

  // Change password
  changePassword: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      const adminId = req.user?.id; // Get admin ID from authenticated user

      // Validate input
      if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
        res.status(400).json({ 
          success: false, 
          message: 'Invalid admin ID' 
        });
        return;
      }

      // Check if all required fields are provided
      if (!currentPassword || !newPassword || !confirmPassword) {
        res.status(400).json({ 
          success: false, 
          message: 'All password fields are required' 
        });
        return;
      }

      // Verify passwords match
      if (newPassword !== confirmPassword) {
        res.status(400).json({ 
          success: false, 
          message: 'New passwords do not match' 
        });
        return;
      }

      // Find the admin by ID
      const admin = await AdminModel.findById(adminId);
      if (!admin) {
        res.status(404).json({ 
          success: false, 
          message: 'Admin not found' 
        });
        return;
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword.trim(), 
        admin.password
      );

      if (!isCurrentPasswordValid) {
        res.status(401).json({ 
          success: false, 
          message: 'Current password is incorrect' 
        });
        return;
      }

      // Password complexity validation
      if (newPassword.length < 8) {
        res.status(400).json({ 
          success: false, 
          message: 'New password must be at least 8 characters long' 
        });
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
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Password change error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ 
        success: false, 
        message: errorMessage 
      });
    }
  },
  // Update admin profile
  updateProfile: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminId = req.user?.id;
      if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
        res.status(400).json({ success: false, message: 'Invalid admin ID' });
        return;
      }
  
      const admin = await AdminModel.findById(adminId);
      if (!admin) {
        res.status(404).json({ success: false, message: 'Admin not found.' });
        return;
      }
  
      const { username, email, phone } = req.body;
  
      // Check unique email
      if (email && email !== admin.email) {
        const emailExists = await AdminModel.findOne({ email });
        if (emailExists) {
          res.status(400).json({ success: false, message: 'Email already in use.' });
          return;
        }
      }
  
      // Check unique username
      if (username && username !== admin.username) {
        const usernameExists = await AdminModel.findOne({ username });
        if (usernameExists) {
          res.status(400).json({ success: false, message: 'Username already in use.' });
          return;
        }
      }
  
      const imageUrl = req.file ? req.file.path : admin.image;
  
      const updatedAdmin = await AdminModel.findByIdAndUpdate(
        adminId,
        {
          $set: {
            username: username || admin.username,
            email: email || admin.email,
            phone: phone || admin.phone,
            image: imageUrl,
          },
        },
        { new: true }
      );
  
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: updatedAdmin,
      });
  
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message || 'Server error.',
      });
    }
  },
  

  // Get admin profile
  getProfile: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminId = req.user?.id;

      if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
        res.status(400).json({ 
          success: false, 
          message: 'Invalid admin ID' 
        });
        return;
      }

      const admin = await AdminModel.findById(adminId).select('-password');
      if (!admin) {
        res.status(404).json({ 
          success: false, 
          message: 'Admin not found' 
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: admin
      });
    } catch (error) {
      console.error('Get profile error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ 
        success: false, 
        message: errorMessage 
      });
    }
  }
};