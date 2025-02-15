import { Request, Response, NextFunction } from "express";
import UserModel from "../../models/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { emailHelper } from "../mailer/mailer";

export const UserController = {

  register: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log("Register endpoint hit with data:", req.body); // Debug request data
  
      if (Object.keys(req.body).length === 0) {
        console.log("Empty request body received.");
        res.status(400).json({ message: "Request body cannot be empty" });
        return;
      }
  
      const { username, email, phoneNumber, businessName, password, confirmPassword, role } = req.body;
  
      if (!username || !email || !phoneNumber || !businessName || !password || !confirmPassword || role) {
        console.log("Missing required fields:", req.body);
        res.status(400).json({ message: "All fields are required" });
        return;
      }
  
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        console.log("User already exists:", email);
        res.status(400).json({ message: "User already exists" });
        return;
      }
  
      const existingPhone = await UserModel.findOne({ phoneNumber });
      if (existingPhone) {
        console.log("Phone number already exists:", phoneNumber);
        res.status(400).json({ message: "Phone number already exists" });
        return;
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new UserModel({
        username,
        email,
        phoneNumber,
        businessName,
        password: hashedPassword,
        confirmPassword: hashedPassword,
      });
  
      await newUser.save();
      console.log("New user registered:", email);
      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      console.error("Error in register:", error);
      next(error);
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

      res.status(200).json({ message: "Login successful" ,token, userId: user._id, user: user.username, Phone: user.phoneNumber});
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
  
      // Generate OTP & reset token
      const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
      const resetTokenExpiry = Date.now() + 3600000; // OTP expiry (1 hour)
  
      // Store OTP and expiry in the user model
      user.passwordResetToken = otp;
      user.resetTokenExpiry = new Date(resetTokenExpiry);
      await user.save();
  
      // Generate JWT token (assuming you have a user object that has the ID)
      const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, {
        expiresIn: '1h', // or any time you prefer
      });
  
      // Console log the token
      console.log("JWT Token for User:", jwtToken); // Log the token to the console
  
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
  },



  verifyOtp: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Get token from headers
        const token = req.headers.authorization?.split(" ")[1]; // Extract token from "Bearer <token>"
        if (!token) {
            res.status(401).json({ message: "Unauthorized: No token provided." });
            return;
        }

        // Verify JWT token and extract user ID
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
        const userId = decoded.userId;

        // Find user by ID
        const user = await UserModel.findById(userId);
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }

        const { otp } = req.body;

        // Validate OTP
        if (!otp) {
            res.status(400).json({ message: "OTP is required." });
            return;
        }

        // Check if OTP is valid and not expired
        if (!user.passwordResetToken || !user.resetTokenExpiry || user.resetTokenExpiry.getTime() < Date.now()) {
            res.status(400).json({ message: "OTP has expired or is invalid." });
            return;
        }

        if (otp !== user.passwordResetToken) {
            res.status(400).json({ message: "Invalid OTP." });
            return;
        }

        // If OTP is valid, clear it from the database
        user.passwordResetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.status(200).json({ message: "OTP verified successfully." });
    } catch (error) {
        console.error("Error in verifyOtp:", error);
        res.status(401).json({ message: "Invalid or expired token." });
        next(error);
    }
},

  // ✅ Reset Password
  resetPassword: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get token from headers
      const token = req.headers.authorization?.split(" ")[1]; // Extract token from "Bearer <token>"
      if (!token) {
        res.status(401).json({ message: "Unauthorized: No token provided." });
        return;
      }

      // Verify JWT token and extract user ID
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
      const userId = decoded.userId;

      // Find user by ID
      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({ message: "User not found." });
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
      user.password = hashedPassword;
      await user.save();

      res.status(200).json({ message: "Password reset successful." });
    } catch (error) {
      console.error("Error in resetPassword:", error);
      res.status(401).json({ message: "Invalid or expired token." });
      next(error);
    }
},

changePassword: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req.user as { id: string }).id; // Extract user ID from token
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate input fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      res.status(400).json({ message: "All fields are required." });
      return;
    }

    // Find user in the database
    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // Check if current password is correct
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
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
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
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
