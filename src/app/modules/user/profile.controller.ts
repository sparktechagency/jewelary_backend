import { Request, Response, NextFunction } from "express";
import UserModel from "../../models/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { uploadCategory } from "../multer/multer.conf";
import multer from "multer";

export const profileController = {

    getUserProfile: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
          const token = req.headers.authorization?.split(" ")[1];
          if (!token) {
            res.status(401).json({ message: "Unauthorized: No token provided." });
            return;
          }
      
          const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
          const user = await UserModel.findById(decoded.userId); // No field selection for now
      
          if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
          }
      
          res.status(200).json({
            user
          }); // Return the entire user object
        } catch (error) {
          next(error);
        }
      },
      
   
      
  updateUserProfile: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // First, use the multer middleware to handle image upload
    uploadCategory(req, res, async (err) => {
      try {
        // Handle file upload errors
        if (err instanceof multer.MulterError) {
          return res.status(400).json({ message: `Multer Error: ${err.message}` });
        }
        if (err) {
          return res.status(400).json({ message: err.message });
        }

        // Authorization: Verify token
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
          return res.status(401).json({ message: "Unauthorized: No token provided." });
        }

        // Decode JWT token
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
        const user = await UserModel.findById(decoded.userId);
        if (!user) {
          return res.status(404).json({ message: "User not found." });
        }

        // Destructure fields from body
        const { username, phoneNumber, businessName, location } = req.body;

        // Check if phone number is already used by another user
        if (phoneNumber && phoneNumber !== user.phoneNumber) {
          const existingPhone = await UserModel.findOne({ phoneNumber });
          if (existingPhone) {
            return res.status(400).json({ message: "Phone number is already in use." });
          }
          user.phoneNumber = phoneNumber;
        }

        // Handle the image upload and save image URL to the user profile if a new image is uploaded
        if (req.file) {
          const imageUrl = `/uploads/categories/${req.file.filename}`; // Assuming 'categories' folder for image storage
          user.profileImage = imageUrl; // Assuming you have a `profileImage` field in the user schema
        }

        // Update user fields with new data
        user.username = username || user.username;
        user.businessName = businessName || user.businessName;
        user.location = location || user.location;

        // Save the updated user object
        await user.save();
        res.status(200).json({ 
          message: "Profile updated successfully.",
           user,
           businessName, 
          
          //  imagePath: user.profileImage 
          });
      } catch (error) {
        next(error);
      }
    });
  },
      
      
    
};


