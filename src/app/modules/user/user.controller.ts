import { Request, Response, NextFunction } from "express";
import UserModel from "../../models/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { emailHelper } from "../mailer/mailer";
import OrderModel from "../../models/order.model";

export const UserController = {

  

  
  // register: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   try {
  //     const { username, email, phoneNumber, businessName, location, password, confirmPassword, role } = req.body;
  
  //     // Validate required fields
  //     if (!username || !email || !phoneNumber || !businessName || !password || !confirmPassword) {
  //       console.log("Missing required fields:", req.body);
  //        res.status(400).json({ message: "All fields are required" });
  //        return
  //       }
  
  //     // Check if the user already exists by email
  //     const existingUser = await UserModel.findOne({ email });
  //     if (existingUser) {
  //       console.log("User already exists:", email);
  //        res.status(400).json({ message: "User already exists" });
  //        return
  //       }
  
  //     // Check if the phone number already exists
  //     const existingPhone = await UserModel.findOne({ phoneNumber });
  //     if (existingPhone) {
  //       console.log("Phone number already exists:", phoneNumber);
  //        res.status(400).json({ message: "Phone number already exists" });
  //     return
  //       }
  
  //     // Hash password
  //     const hashedPassword = await bcrypt.hash(password, 10);
  
  //     // Create a new user with location and role being optional
  //     const newUser = new UserModel({
  //       username,
  //       email,
  //       phoneNumber,
  //       businessName,
  //       location: location || null,  // Set location to null if not provided
  //       role: role || "user",  // Default role to "user" if not provided
  //       password: hashedPassword,
  //       confirmPassword: hashedPassword,
  //     });
  
  //     // Save the user to the database
  //     await newUser.save();
  //     console.log("New user registered:", email);
  //     res.status(201).json({ message: "User registered successfully" });
  //   } catch (error) {
  //     console.error("Error in register:", error);
  //     next(error);
  //   }
  // },
  
  register: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Destructure the request body to get the fields
      const { username, email, phoneNumber, businessName, location, password, confirmPassword, role } = req.body;
  
      // Validate required fields
      if (!username || !email || !phoneNumber || !businessName || !password || !confirmPassword) {
        console.log("Missing required fields:", req.body);
        res.status(400).json({ message: "All fields are required" });
        return;
      }
  
      // Check if the username already exists
      const existingUsername = await UserModel.findOne({ username });
      if (existingUsername) {
        console.log("Username already exists:", username);
        res.status(400).json({ message: "Username already exists. Please provide a valid username." });
        return;
      }
  
      // Check if the email already exists
      const existingEmail = await UserModel.findOne({ email });
      if (existingEmail) {
        console.log("Email already exists:", email);
        res.status(400).json({ message: "Email already exists. Please provide a valid email." });
        return;
      }
  
      // Check if the phone number already exists
      const existingPhone = await UserModel.findOne({ phoneNumber });
      if (existingPhone) {
        console.log("Phone number already exists:", phoneNumber);
        res.status(400).json({ message: "Phone number already exists. Please provide a valid phone number." });
        return;
      }
  
      // Check if the business name already exists
      const existingBusinessName = await UserModel.findOne({ businessName });
      if (existingBusinessName) {
        console.log("Business name already exists:", businessName);
        res.status(400).json({ message: "Business name already exists. Please provide a valid business name." });
        return;
      }
  
      // Ensure that password and confirmPassword match
      if (password !== confirmPassword) {
        console.log("Passwords do not match.");
        res.status(400).json({ message: "Passwords do not match. Please confirm your password." });
        return;
      }
  
      // Hash password before saving
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new user with optional location and role
      const newUser = new UserModel({
        username,
        email,
        phoneNumber,
        businessName,
        location: location || null,  // Set location to null if not provided
        role: role || "user",  // Default role to "user" if not provided
        password: hashedPassword,
        confirmPassword: hashedPassword,  // Confirm password is hashed too
      });
  
      // Save the new user to the database
      await newUser.save();
      console.log("New user registered:", email);
      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      console.error("Error in register:", error);
      next(error);  // Pass the error to the next middleware (error handler)
    }
  },
  
  
  

  // login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   try {
  //     const { email, password } = req.body;

  //     const user = await UserModel.findOne({ email });
  //     if (!user) {
  //       res.status(400).json({ message: "Invalid credentials" });
  //       return;
  //     }

  //     const isPasswordValid = await bcrypt.compare(password, user.password);
  //     if (!isPasswordValid) {
  //       res.status(400).json({ message: "Invalid credentials" });
  //       return;
  //     }

  //     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "default_secret", {
  //       expiresIn: "1h",
  //     });

  //     res.status(200).json({ message: "Login successful" ,token, userId: user._id, user: user.username, Phone: user.phoneNumber});
  //   } catch (error) {
  //     next(error); // Pass error to middleware
  //   }
  // },

  login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
  
      const user = await UserModel.findOne({ email });
      if (!user) {
        res.status(400).json({ message: "Invalid credentials" });
        return;
      }
  
      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(400).json({ message: "Invalid credentials" });
        return;
      }
  
      // Check if account is active
      if (!user.active) {
        res.status(403).json({ message: "Your account is deactive. Please contact support." });
        return;
      }
  
      // Create JWT token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "default_secret", {
        expiresIn: "1h",
      });
  
      res.status(200).json({ message: "Login successful", token, userId: user._id, user: user.username, Phone: user.phoneNumber });
    } catch (error) {
      next(error);
    }
  },
  updateActiveStatus: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { active } = req.body;
  
      // Validate that active is a boolean
      if (typeof active !== "boolean") {
        res.status(400).json({ message: "Active status must be a boolean value." });
        return;
      }
  
      // Check that the requester is an admin.
      // This assumes your authentication middleware attaches the user object to req.user.
      if (!req.user || (req.user as any).role !== "admin") {
        res.status(403).json({ message: "Unauthorized: Only admin can update active status." });
        return;
      }
  
      // Find the user to update
      const user = await UserModel.findById(id);
      if (!user) {
        res.status(404).json({ message: "User not found." });
        return;
      }
  
      user.active = active;
      await user.save();
  
      res.status(200).json({ message: "User active status updated.", active: user.active });
    } catch (error) {
      next(error);
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
    const users = await UserModel.find({}, "_id  username email");

    // Get the total number of users
    const totalUsers = users.length;

    res.json({
      totalUsers,
      users: users.map(user => ({
        id: user._id,    // Include user ID
        name: user.username,
        email: user.email,
        
      })),  
    });
  } catch (error) {
    next(error); // Pass error to middleware
  }
},

// userAllOrderDetails: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   try {
//     // Fetch all orders along with user details by populating userId
//     const orders = await OrderModel.find({})
//       .populate("userId", "username email phoneNumber") // Populate user details
//       .select("orderStatus totalAmount paidAmount dueAmount paymentStatus orderStatus userId contactName contactNumber deliverTo") // Select necessary fields

//     // Calculate the necessary order statistics
//     const totalOrders = orders.length;
//     const cancelledOrders = orders.filter(order => order.orderStatus === "cancelled").length;
//     const pendingOrders = orders.filter(order => order.orderStatus === "pending").length;
//     const runningOrders = orders.filter(order => order.orderStatus === "running").length;
//     const completedOrders = orders.filter(order => order.orderStatus === "completed").length;

//     // Calculate total amount paid and total amount due
//     const totalPaid = orders.reduce((sum, order) => sum + order.paidAmount, 0);
//     const totalDue = orders.reduce((sum, order) => sum + order.dueAmount, 0);

//     // Map through the orders to get user details along with order stats
//     const orderDetails = orders.map(order => ({
//       orderStatus: order.orderStatus,
//       totalAmount: order.totalAmount,
//       paidAmount: order.paidAmount,
//       dueAmount: order.dueAmount,
//       paymentStatus: order.paymentStatus,
//       contactName: order.contactName,
//       contactNumber: order.contactNumber,
//       deliverTo: order.deliverTo,
//       user: {
//         name: order.userId.username, // Access populated fields
//         email: order.userId.email,
//         phoneNumber: order.userId.phoneNumber
//       }
//     }));

//     res.json({
//       totalOrders,
//       cancelledOrders,
//       pendingOrders,
//       runningOrders,
//       completedOrders,
//       totalPaid,
//       totalDue,
//       orderDetails
//     });
//   } catch (error) {
//     next(error); // Pass error to middleware
//   }
// },


userAllOrderDetails: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Fetch all orders along with user details by populating userId
    const orders = await OrderModel.find({})
      .populate("userId", "username email phoneNumber")  // Populate user details
      .select("orderStatus totalAmount paidAmount dueAmount paymentStatus orderStatus userId contactName contactNumber deliverTo") // Select necessary fields

    // Calculate the necessary order statistics
    const totalOrders = orders.length;
    const cancelledOrders = orders.filter(order => order.orderStatus === "cancelled").length;
    const pendingOrders = orders.filter(order => order.orderStatus === "pending").length;
    const runningOrders = orders.filter(order => order.orderStatus === "running").length;
    const completedOrders = orders.filter(order => order.orderStatus === "completed").length;

    // Calculate total amount paid and total amount due
    const totalPaid = orders.reduce((sum, order) => sum + order.paidAmount, 0);
    const totalDue = orders.reduce((sum, order) => sum + order.dueAmount, 0);

    // Map through the orders to get user details along with order stats
    const orderDetails = orders.map(order => ({
      orderStatus: order.orderStatus,
      totalAmount: order.totalAmount,
      paidAmount: order.paidAmount,
      dueAmount: order.dueAmount,
      paymentStatus: order.paymentStatus,
      contactName: order.contactName,
      contactNumber: order.contactNumber,
      deliverTo: order.deliverTo,
      user: order.userId ? {  // Check if userId exists
        name: order.userId.username || 'N/A',  // Fallback if username is missing
        email: order.userId.email || 'N/A',    // Fallback if email is missing
        phoneNumber: order.userId.phoneNumber || 'N/A'  // Fallback if phoneNumber is missing
      } : {  // In case userId is null
        name: 'Unknown User',
        email: 'Unknown Email',
        phoneNumber: 'Unknown Phone Number'
      }
    }));

    res.json({
      totalOrders,
      cancelledOrders,
      pendingOrders,
      runningOrders,
      completedOrders,
      totalPaid,
      totalDue,
      orderDetails
    });
  } catch (error) {
    next(error); // Pass error to middleware
  }
},


// searchUser: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   const { email } = req.body; // Access email from query parameters
//   if (!email) {
//     res.status(400).json({ message: "Email is required" });
//     return;
//   }
  
//   try {
//     const user = await UserModel.findOne({ email });
//     if (!user) {
//       res.status(404).json({ message: "User not found" });
//       return;
//     }

//     res.json(user);
//   } catch (error) {
//     next(error); // Pass error to middleware
//   }
// },





searchUser: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ message: "Email is required" });
    return;
  }
  
  try {
    // Find the user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    
    // Find all orders for the user
    const orders = await OrderModel.find({ userId: user._id });
    
    // Compute totals
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.orderStatus === "pending").length;
    const runningOrders = orders.filter(o => o.orderStatus === "running").length;
    const completeOrders = orders.filter(o => o.orderStatus === "completed").length;
    const cancelledOrders = orders.filter(o => o.orderStatus === "cancelled").length;
    const totalPaid = orders.reduce((sum, o) => sum + o.paidAmount, 0);
    const totalDue = orders.reduce((sum, o) => sum + o.dueAmount, 0);
    
    // Construct full URL for the profile image
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const profileImageUrl = user.profileImage ? baseUrl + user.profileImage : null;
    
    res.json({
      user,
      profileImageUrl,
      totalOrders,
      pendingOrders,
      runningOrders,
      completeOrders,
      cancelledOrders,
      totalPaid,
      totalDue
    });
  } catch (error) {
    next(error);
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
