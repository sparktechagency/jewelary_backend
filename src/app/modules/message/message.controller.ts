// import { Request, Response } from 'express';
// import { MessageService } from './message.service';

// export class MessageController {
//   static async sendMessage(req: Request, res: Response): Promise<void> {
//     try {
//       console.log("Received Request Body:", req.body); // Debugging log
//       const { receiverId, content, senderType, productId } = req.body;
      

//       if (!receiverId || !content || !senderType) {
//         res.status(400).json({ message: "Missing required fields" });
//         return;
//       }

//       const message = await MessageService.sendMessage(receiverId, content, senderType, productId);
//       res.status(201).json(message); // ✅ No explicit `return`
//         } catch (error) {
//       console.error("Error sending message:", error);
//       res.status(500).json({ message: "Error sending message", error });
//     }
//   }

//   static async getConversation(req: Request, res: Response): Promise<void> {
//     try {
//       // Check if the user is authenticated and check the role (whether it's an admin or regular user)
//       if (!req.user || !req.user.id) {
//          res.status(403).json({ message: "Unauthorized access" });
//          return
//       }
  
//       // Fetch the userId from the logged-in user (req.user.id) and the partnerId from the request params
//       const userId = req.user.id;
//       const partnerId = req.params.partnerId;
  
//       // If the logged-in user is an admin, they can access any conversation
//       if (req.user.role === 'admin') {
//         const conversation = await MessageService.getConversation(userId, partnerId);
//          res.json(conversation); // Return the conversation for the admin
//          return
//       }
  
//       // If it's not an admin, ensure they can only see their own conversations
//       const conversation = await MessageService.getConversation(userId, partnerId);
//       res.json(conversation); // Return the conversation for the user
  
//     } catch (error) {
//       console.error("Error retrieving conversation:", error);
//       res.status(500).json({ message: "Error retrieving conversation", error });
//     }
//   }
  
//   static async markAsRead(req: Request, res: Response): Promise<void> {
//     try {
//       const { messageId } = req.params;

//       if (!messageId) {
//         res.status(400).json({ message: "Message ID is required" });
//         return;
//       }

//       const message = await MessageService.markAsRead(messageId);
//       res.json(message); // ✅ No explicit `return`
//     } catch (error) {
//       console.error("Error marking message as read:", error);
//       res.status(500).json({ message: "Error marking message as read", error });
//     }
//   }
// }

// import { Request, Response } from 'express';
// import { MessageService } from './message.service';
// import { UserService } from './user.service';
// import { AuthRequest } from '../../../types/express';

// export class MessageController {
//   // Send message from user or admin
//   static async sendMessage(req: Request, res: Response): Promise<void> {
//     try {
//       console.log("Received Request Body:", req.body); // Debugging log
//       const { receiverId, content, senderType, productId, messageSource } = req.body;
      
//       // Validate required fields
//       if (!receiverId || !content || !senderType) {
//         res.status(400).json({ message: "Missing required fields" });
//         return;
//       }

//       // If it's a product page message, ensure productId is provided for users
//       if (messageSource === 'productPage' && senderType === 'user' && !productId) {
//         res.status(400).json({ message: "Missing productId for product page messages" });
//         return;
//       }

//       // If it's a message box message, allow admins or users to send normal messages (without productId)
//       if (messageSource === 'messageBox' && senderType === 'user' && productId) {
//         console.log("Users should not provide productId for message box messages. Ignoring productId.");
//       }

//       // Send the message via the MessageService
//       const message = await MessageService.sendMessage(receiverId, content, senderType, productId, messageSource);

//       // Return the message response
//       res.status(201).json(message);  // Return the sent message
//     } catch (error) {
//       console.error("Error sending message:", error);
//       res.status(500).json({ message: "Error sending message", error });
//     }
//   }

  


//   // // Get all messages for admin or specific messages for the user
//   // static async getConversation(req: Request, res: Response): Promise<void> {
//   //   try {
//   //     // Check if the user is authenticated
//   //     if (!req.user || !req.user.id) {
//   //        res.status(403).json({ message: "Unauthorized access" });
//   //        return
//   //     }

//   //     const userId = req.user.id;
//   //     const partnerId = req.params.partnerId;

//   //     if (!partnerId) {
//   //       res.status(400).json({ message: "Partner ID is required" });
//   //       return;
//   //     }

//   //     const partnerExists = await UserService.userExists(partnerId);
//   //     if (!partnerExists) {
//   //       res.status(404).json({ message: "Partner not found" });
//   //       return;
//   //     }

//   //     // If the logged-in user is an admin, they can access all conversations
//   //     if (req.user.role === 'admin') {
//   //       const conversation = await MessageService.getConversation(userId, partnerId);
//   //        res.json(conversation); // Return the conversation for the admin
//   //        return
//   //     }

//   //     // If the logged-in user is not an admin, they can only view their own conversations
//   //     const conversation = await MessageService.getConversation(userId, partnerId);
//   //      res.json(conversation); // Return the conversation for the user
//   //      return
//   //   } catch (error) {
//   //     console.error("Error retrieving conversation:", error);
//   //     res.status(500).json({ message: "Error retrieving conversation", error });
//   //   }
//   // }

//   static async getConversation(req: AuthRequest, res: Response): Promise<void> {
//     try {
//       // Add debug logs
//       console.log('Auth Header:', req.headers.authorization);
//       console.log('User object:', req.user);
//       console.log('Partner ID:', req.params.partnerId);

//       // Check if the user is authenticated
//       if (!req.user || !req.user.id) {
//         console.log('Authentication failed: No user or user ID');
//         res.status(403).json({ message: "Unauthorized access" });
//         return;
//       }

//       const userId = req.user.id;
//       const partnerId = req.params.partnerId;

//       console.log('User ID:', userId);
//       console.log('Partner ID:', partnerId);

//       // Validate partnerId exists
//       if (!partnerId) {
//         res.status(400).json({ message: "Partner ID is required" });
//         return;
//       }

//       // First, verify if the partnerId exists in your system
//       const partnerExists = await UserService.userExists(partnerId);
//       if (!partnerExists) {
//         res.status(404).json({ message: "Partner not found" });
//         return;
//       }

//       // If user is admin, they can access any conversation
//       if (req.user.role === 'admin') {
//         const conversation = await MessageService.getConversation(userId, partnerId);
//         res.json(conversation);
//         return;
//       }

//       // For regular users, check if they have any existing conversation with the partner
//       const existingConversation = await MessageService.getConversation(userId, partnerId);
//       res.json(existingConversation);

//     } catch (error) {
//       console.error("Error retrieving conversation:", error);
//       res.status(500).json({ message: "Error retrieving conversation", error });
//     }
//   }

//   // Mark message as read
 
//   static async markAsRead(req: Request, res: Response): Promise<void> {
//     try {
//       const { messageId } = req.params;

//       if (!messageId) {
//         res.status(400).json({ message: "Message ID is required" });
//         return;
//       }

//       const message = await MessageService.markAsRead(messageId);
//       res.json(message);  // Return the updated message
//     } catch (error) {
//       console.error("Error marking message as read:", error);
//       res.status(500).json({ message: "Error marking message as read", error });
//     }
//   }

//   // Admin can view all messages
//   // static async getAllMessages(req: Request, res: Response): Promise<void> {
//   //   try {
//   //     if (!req.user || req.user.role !== 'admin') {
//   //        res.status(403).json({ message: "Access denied. Admins only." });
//   //        return
//   //     }

//   //     // Admin can view all messages
//   //     const allMessages = await MessageService.getAllMessages();
//   //     res.json(allMessages);
//   //   } catch (error) {
//   //     console.error("Error fetching all messages:", error);
//   //     res.status(500).json({ message: "Error fetching all messages", error });
//   //   }
//   // }

//   static async getAllMessages(req: Request, res: Response): Promise<void> {
//     try {
//       // Debug: Log the headers and body to check if anything is wrong
//       console.log("Request Headers:", req.headers);
//       console.log("Request Body (should be empty for GET):", req.body);
  
//       // Ensure the user is authenticated and is an admin
//       if (!req.user || req.user.role !== 'admin') {
//         res.status(403).json({ message: "Access denied. Admins only." });
//         return;
//       }
  
//       // Admin can view all messages
//       const allMessages = await MessageService.getAllMessages();
//       res.json(allMessages);  // Return all messages
  
//     } catch (error) {
//       console.error("Error fetching all messages:", error);
//       res.status(500).json({ message: "Error fetching all messages", error });
//     }
//   }
  
// }

// import { NextFunction, Request, Response } from 'express';
// import { MessageService } from './message.service';
// import { MessageModel } from '../../models/message.model';
// import { io } from '../../../app';

// export class MessageController {
  


//   static getAllMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const { userId } = req.params; // Ensure userId is passed as a URL parameter

//       // Validate userId
//       if (!userId) {
//         res.status(400).json({ message: "User ID is required." });
//         return;
//       }

//       // Fetch messages where userId is either sender or receiver
//       const messages = await MessageModel.find({
//         $or: [{ sender: userId }, { receiver: userId }],
//       })
//         .sort({ createdAt: -1 }) // Sort by date in descending order
//         .populate('sender receiver') // Populate sender and receiver fields
//         .exec();

//       if (!messages || messages.length === 0) {
//         res.status(404).json({ message: "No messages found for this user." });
//         return;
//       }

//       res.status(200).json({
//         messages,
//       });
//     } catch (error) {
//       console.error("Error retrieving messages:", error);
//       next(error); // Let Express handle the error
//     }
//   }



//   static async sendMessage(req: Request, res: Response): Promise<void> {
//     try {
//       const { receiverId, content, senderType, productId, messageSource } = req.body;

//       // Check if required fields are present
//       if (!receiverId || !content || !senderType) {
//          res.status(400).json({ message: "Missing required fields" });
//          return
//       }

//       // If it's a product page message, ensure productId is provided for users
//       if (messageSource === 'productPage' && senderType === 'user' && !productId) {
//          res.status(400).json({ message: "Missing productId for product page messages" });
//          return
//       }

//       // If it's a message box message, allow admins or users to send normal messages (without productId)
//       if (messageSource === 'messageBox' && senderType === 'user' && productId) {
//         console.log("Users should not provide productId for message box messages. Ignoring productId.");
//       }

//       // Send the message via the MessageService
//       const message = await MessageService.sendMessage(receiverId, content, senderType, productId, messageSource);

//         // Emit socket event for real-time message delivery
//       io.to(receiverId).emit("receiveMessage", message);
//       res.status(201).json(message);  // Return the sent message
//     } catch (error) {
//       console.error("Error sending message:", error);
//       res.status(500).json({ message: "Error sending message", error });
//     }
//   }

//   // static async getConversation(req: Request, res: Response): Promise<void> {
//   //   try {
//   //     if (!req.user || !req.user.id) {
//   //        res.status(403).json({ message: "Unauthorized access" });
//   //        return
//   //     }

//   //     const userId = req.user.id;
//   //     const partnerId = req.params.partnerId;

//   //     // If the logged-in user is an admin, they can access all conversations
//   //     if (req.user.role === 'admin') {
//   //       const conversation = await MessageService.getConversation(userId, partnerId);
//   //        res.json(conversation);  // Return the conversation for the admin
//   //        return
//   //     }

//   //     // If the logged-in user is not an admin, they can only view their own conversations
//   //     const conversation = await MessageService.getConversation(userId, partnerId);
    
//   //      res.json(conversation);  // Return the conversation for the user
//   //   } catch (error) {
//   //     console.error("Error retrieving conversation:", error);
//   //     res.status(500).json({ message: "Error retrieving conversation", error });
//   //   }
//   // }

//   static async getConversation(req: Request, res: Response): Promise<void> {
//     try {
//       if (!req.user || !req.user.id) {
//                res.status(403).json({ message: "Unauthorized access" });
//                return
//             }
//       const userId = req.user.id;
//       const partnerId = req.params.partnerId;

//       if (!partnerId) {
//         res.status(400).json({ message: "Partner ID is required" });
//         return;
//       }

//       const conversation = await MessageService.getConversation(userId, partnerId);
//       res.json(conversation);
//     } catch (error) {
//       console.error("Error retrieving conversation:", error);
//       res.status(500).json({ message: "Error retrieving conversation", error });
//     }
//   }


//   static async markAsRead(req: Request, res: Response): Promise<void> {
//     try {
//       const { messageId } = req.params;

//       if (!messageId) {
//          res.status(400).json({ message: "Message ID is required" });
//          return
//       }

//       const message = await MessageService.markAsRead(messageId);
//       res.json(message);  // Return the updated message
//     } catch (error) {
//       console.error("Error marking message as read:", error);
//       res.status(500).json({ message: "Error marking message as read", error });
//     }
//   }
// }


import { Request, Response, NextFunction } from 'express';
import { MessageService } from './message.service';
import { io } from '../../../app';
import UserModel from '../../models/user.model';
import { MessageModel } from '../../models/message.model';
import { AdminModel } from '../../models/admin.model';
import mongoose from 'mongoose';
import { types } from 'util';

export class MessageController {
  static getAllMessages(arg0: string, isAuthenticated: (req: import("../../../types/express").AuthRequest, res: Response, next: NextFunction) => void, getAllMessages: any) {
      throw new Error('Method not implemented.');
  }

  static async getConversation(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
        res.status(403).json({ message: "Unauthorized access" });
        return;
      }
  
      const userId = req.user.id;
      
      // Find the first available admin
      const admin = await AdminModel.findOne();
      if (!admin) {
        res.status(500).json({ message: "Admin not found." });
        return;
      }
      const adminId = admin._id.toString();
  
      // Pagination settings
      const page = parseInt(req.query.page as string) || 1;
      const limit = 10;
      const skip = (page - 1) * limit;
  
      // Fetch conversation messages between user and admin with pagination
      const conversation = await MessageModel.find({
        $or: [
          { sender: userId, receiver: adminId },
          { sender: adminId, receiver: userId },
        ],
      })
        .sort({ createdAt: -1 }) // Show latest messages first
        .skip(skip)
        .limit(limit);
  
      res.status(200).json({
        success: true,
        message: "Conversation retrieved successfully.",
        data: conversation,
        pagination: {
          currentPage: page,
          pageSize: limit,
        },
      });
  
    } catch (error) {
      console.error("❌ Error retrieving conversation:", error);
      res.status(500).json({ message: "Error retrieving conversation", error });
    }
  }
  
  static async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;

      if (!messageId) {
        res.status(400).json({ message: "Message ID is required" });
        return;
      }

      const message = await MessageService.markAsRead(messageId);
      res.status(200).json(message);
    } catch (error) {
      res.status(500).json({ message: "Error marking message as read", error });
    }
  }


// static async sendMessage(req: Request, res: Response): Promise<void> {
//   try {
//     console.log("🔍 Incoming Request Body:", req.body);
//     console.log("🔍 Incoming Files:", req.files);

//     const { receiverId, content, senderType, productId, messageSource, type } = req.body;

//     if (!type) {
//       res.status(400).json({ message: "Type is required (text, voice, attachments)." });
//       return;
//     }

//     let fileUrls: string[] = [];
//     if (req.files) {
//       const uploadedFiles = req.files as Express.Multer.File[];
//       fileUrls = uploadedFiles.map(file => `/uploads/messages/${file.filename}`);
//     }

//     let finalReceiverId = receiverId;

//     // If sender is a user and no receiver is set, send to the first admin
//     if (!receiverId && senderType === "user") {
//       const admin = await AdminModel.findOne();
//       if (!admin) {
//         res.status(500).json({ message: "Admin not found." });
//         return;
//       }
//       finalReceiverId = admin._id.toString();
//     }

//     if (!receiverId && senderType === "admin") {
//       res.status(400).json({ message: "User ID is required for admin messages." });
//       return;
//     }

//     const finalProductId = (messageSource === "productPage" && senderType === "user") ? productId : null;

//     // Fetch sender user details
//     let userDetails = null;
//     if (req.user) {
//       userDetails = await UserModel.findById(req.user.id).select("username email");
//     }

//     const message = new MessageModel({
//       sender: req.user ? req.user.id : null,
//       receiver: finalReceiverId,
//       content: type === "text" ? content : "[]",
//       senderType,
//       productId: finalProductId,
//       messageSource,
//       type, // Text, Voice, Attachments
//       files: fileUrls,
//       isRead: false,
//     });

//     await message.save();

//     console.log("📩 Message Saved:", message);

//     // ✅ Emit event for the receiver (real-time message update)
//     io.emit(`message::${finalReceiverId}`, {
//       content: message.content,
//       senderType: message.senderType,
//       createdAt: message.createdAt,
//       type: message.type,
//       files: message.files,
//     });

//     io.to(finalReceiverId).emit("receiveMessage", message);

//     // ✅ Emit event to Admin Dashboard with full user details
//     io.emit("admin::userMessages", {
//       userId: req.user?.id || "Unknown",
//       username: userDetails?.username || "Unknown",
//       email: userDetails?.email || "Unknown",
//       senderType: senderType,
//       content: message.content,
//       type: message.type,
//       files: message.files,
//       timestamp: message.createdAt,
//     });

//     res.status(201).json({
//       success: true,
//       message: "Message sent successfully.",
//       data: message,
//     });
//   } catch (error) {
//     console.error("❌ Error sending message:", error);
//     res.status(500).json({ message: "Error sending message", error });
//   }
// }

// static async sendMessage(req: Request, res: Response): Promise<void> {
//   try {
//     console.log("🔍 Incoming Request Body:", req.body);
//     console.log("🔍 Incoming Files:", req.files);

//     const { receiverId, content, senderType, productId, messageSource, type } = req.body;

//     if (!type) {
//       res.status(400).json({ message: "Type is required (text, voice, attachments)." });
//       return;
//     }

//     let fileUrls: string[] = [];
//     if (req.files) {
//       const uploadedFiles = req.files as Express.Multer.File[];
//       fileUrls = uploadedFiles.map(file => `/uploads/messages/${file.filename}`);
//     }

//     let finalReceiverId = receiverId;

//     // If sender is a user and no receiver is set, send to the first admin
//     if (!receiverId && senderType === "user") {
//       const admin = await AdminModel.findOne();
//       if (!admin) {
//         res.status(500).json({ message: "Admin not found." });
//         return;
//       }
//       finalReceiverId = admin._id.toString();
//     }

//     if (!receiverId && senderType === "admin") {
//       res.status(400).json({ message: "User ID is required for admin messages." });
//       return;
//     }

//     const finalProductId = (messageSource === "productPage" && senderType === "user") ? productId : null;

//     // ✅ Fetch sender user details (Ensure user exists)
//     // let userDetails = { username: "", email: "" }; // Default values
//     // if (req.user?.id) {
//     //   const user = await UserModel.findById(req.user.id).select("username email");
//     //   if (user) {
//     //     userDetails = { username: user.username, email: user.email };
//     //   }
//     // }

//     // // ✅ Count total messages sent by the user
//     // const totalMessages = await MessageModel.countDocuments({
//     //   sender: req.user?.id,
//     // });

//     // // ✅ Save message to database
//     // const message = new MessageModel({
//     //   sender: req.user ? req.user.id : null,
//     //   receiver: finalReceiverId,
//     //   content: type === "text" ? content : "[Attachment]",
//     //   userDetails,
//     //   senderType,
//     //   productId: finalProductId,
//     //   messageSource,
//     //   type, // Text, Voice, Attachments
//     //   files: fileUrls,
//     //   isRead: false,
//     // });

//     // await message.save();

//     // ✅ Fetch sender user details (Ensure user exists)
// let userDetails = { username: "Unknown", email: "Unknown" }; // Default values

// if (req.user?.id) {
//   try {
//     const user = await UserModel.findById(req.user.id).select("username email");
//     if (user) {
//       userDetails = { username: user.username, email: user.email };
//     } else {
//       console.warn(`⚠️ User not found in DB: ${req.user.id}`);
//     }
//   } catch (error) {
//     console.error(`❌ Error fetching user details for ID ${req.user.id}:`, error);
//   }
// }

// // ✅ Count total messages sent by the user
// let totalMessages = 0;
// try {
//   totalMessages = await MessageModel.countDocuments({ sender: req.user?.id });
// } catch (error) {
//   console.error("❌ Error counting user messages:", error);
// }

// // ✅ Save message to database
// const message = new MessageModel({
//   sender: req.user ? req.user.id : null,
//   receiver: finalReceiverId,
//   content: type === "text" ? content : "[Attachment]",
//   senderType,
//   productId: finalProductId,
//   messageSource,
//   type, // Text, Voice, Attachments
//   files: fileUrls,
//   isRead: false,
//   userDetails, // ✅ Storing user details properly
// });

// await message.save();


//     console.log("📩 Message Saved:", message);

//     // ✅ Emit event for the receiver (real-time message update)
//     io.emit(`message::${finalReceiverId}`, {
//       content: message.content,
//       senderType: message.senderType,
//       userDetails,
//       email: userDetails.email,
//       createdAt: message.createdAt,
//       type: message.type,
//       files: message.files,
//     });

//     io.to(finalReceiverId).emit("receiveMessage", message);

//     // ✅ Emit event to Admin Dashboard with full user details
//     const socketData = {
//       userId: req.user?.id || "Unknown",
//       username: userDetails.username,
//       email: userDetails.email,
//       totalMessages: totalMessages,
//       lastMessage: message.content,
//       messageType: message.type,
//       files: message.files,
//       timestamp: message.createdAt,
//     };

//     console.log("📢 Emitting to admin::userMessages:", socketData);
//     io.emit("admin::userMessages", socketData);

//     res.status(201).json({
//       success: true,
//       message: "Message sent successfully.",
//       data: message,
//     });
//   } catch (error) {
//     console.error("❌ Error sending message:", error);
//     res.status(500).json({ message: "Error sending message", error });
//   }
// }

static async sendMessage(req: Request, res: Response): Promise<void> {
  try {
    console.log("🔍 Incoming Request Body:", req.body);
    console.log("🔍 Incoming Files:", req.files);

    const { receiverId, content, senderType, productId, messageSource, type } = req.body;

    if (!type) {
      res.status(400).json({ message: "Type is required (text, voice, attachments)." });
      return;
    }

    let fileUrls: string[] = [];
    if (req.files) {
      const uploadedFiles = req.files as Express.Multer.File[];
      fileUrls = uploadedFiles.map(file => `/uploads/messages/${file.filename}`);
    }

    let finalReceiverId = receiverId;

    // If sender is a user and no receiver is set, send to the first admin
    if (!receiverId && senderType === "user") {
      const admin = await AdminModel.findOne();
      if (!admin) {
        res.status(500).json({ message: "Admin not found." });
        return;
      }
      finalReceiverId = admin._id.toString();
    }

    if (!receiverId && senderType === "admin") {
      res.status(400).json({ message: "User ID is required for admin messages." });
      return;
    }

    const finalProductId = (messageSource === "productPage" && senderType === "user") ? productId : null;

    // Get the user ID - IMPORTANT CHANGE HERE
    const userId = req.user?.id || req.body.userId || req.body.sender;
    console.log("🔍 Using User ID for lookup:", userId);
    const user = await UserModel.findById(userId).lean();
    // Fetch user details with EXPLICIT error handling and conversion to string
    let userDetails = { username: "Unknown", email: "Unknown" };
    if (userId) {
      try {
        // Convert to string to avoid ObjectId comparison issues
        const userIdString = userId.toString();
        console.log("🔍 Looking up user with string ID:", userIdString);
        
        
        console.log("🔍 User lookup result:", user);
        
        if (user) {
          userDetails = { 
            username: user.username || "Unknown", 
            email: user.email || "Unknown" 
          };
          console.log("✅ Found user details:", userDetails);
        } else {
          console.warn(`⚠️ User not found for ID: ${userIdString}`);
          
          // Additional fallback: try querying by _id as a last resort
          console.log("🔄 Attempting alternative lookup with {_id: userId}");
          const altUser = await UserModel.findOne({ _id: userIdString }).lean();
          if (altUser) {
            userDetails = {
              username: altUser.username || "Unknown",
              email: altUser.email || "Unknown"
            };
            console.log("✅ Found user with alternative lookup:", userDetails);
          }
        }
      } catch (error) {
        console.error(`❌ Error fetching user details:`, error);
        // Try a direct MongoDB query as last resort
        try {
          console.log("🔄 Attempting raw MongoDB query");
          const db = mongoose.connection.db;
          if (!db) {
            throw new Error("Database connection is not available.");
          }
          const userCollection = db.collection('users');
          const rawUser = await userCollection.findOne({ _id: new mongoose.Types.ObjectId(userId.toString()) });
          if (rawUser) {
            userDetails = {
              username: rawUser.username || "Unknown",
              email: rawUser.email || "Unknown"
            };
            console.log("✅ Found user with raw query:", userDetails);
          }
        } catch (dbError) {
          console.error("❌ Raw DB query also failed:", dbError);
        }
      }
    }

    // Count total messages
    let totalMessages = 0;
    try {
      totalMessages = await MessageModel.countDocuments({ sender: userId });
    } catch (error) {
      console.error("❌ Error counting user messages:", error);
    }

    // Save message to database
    const message = new MessageModel({
      sender: userId,
      receiver: finalReceiverId,
      content: type === "text" ? content : "[Attachment]",
      senderType,
      productId: finalProductId,
      messageSource,
      type,
      files: fileUrls,
      isRead: false,
      userDetails: userDetails, // Using our lookup result
    });

    await message.save();
    console.log("📩 Message Saved:", message);

    // Socket emissions with our found user details
    io.emit(`message::${finalReceiverId}`, {
      content: message.content,
      senderType: message.senderType,
      username: userDetails.username,
      email: userDetails.email,
      createdAt: message.createdAt,
      type: message.type,
      files: message.files,
    });

    io.to(finalReceiverId).emit("receiveMessage", message);

    const socketData = {
      userId: userId || "Unknown",
      username: userDetails.username,
      email: userDetails.email,
      totalMessages: totalMessages,
      lastMessage: message.content,
      messageType: message.type,
      files: message.files,
      timestamp: message.createdAt,
    };

    console.log("📢 Emitting to admin::userMessages:", socketData);
    io.emit("admin::userMessages", socketData);

    res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      data: message,
    });
  } catch (error) {
    console.error("❌ Error sending message:", error);
    res.status(500).json({ message: "Error sending message", error });
  }
}




static async sendAdminMessage(req: Request, res: Response): Promise<void> {
  try {
    const { userId, content, type } = req.body;

    // Validate required field: "type"
    if (!type) {
      res.status(400).json({ message: "Type is required (text, voice, attachments)." });
      return;
    }

    let finalUserId = userId;

    // If userId is not provided, find any existing user
    if (!userId) {
      const user = await UserModel.findOne();
      if (!user) {
        res.status(404).json({ message: "No users found." });
        return;
      }
      finalUserId = (user as any)._id.toString();
    }

    const admin = await AdminModel.findOne();
    if (!admin) {
      res.status(500).json({ message: "Admin not found." });
      return;
    }

    // Handle file uploads (Attachments and Voice Messages)
    let fileUrls: string[] = [];
    if (req.files) {
      const uploadedFiles = req.files as Express.Multer.File[];
      fileUrls = uploadedFiles.map(file => `/uploads/messages/${file.filename}`);
    }

    // Save message to database
    const message = new MessageModel({
      sender: admin._id,
      receiver: finalUserId,
      content: type === "text" ? content : " ",
      senderType: "admin",
      type, // Text, Voice, Attachments
      isRead: false,
      files: fileUrls,
    });

    await message.save();

    console.log("📩 Admin Message Saved:", message);

    // Emit real-time update via WebSocket
    io.emit(`message::${finalUserId}`, {
      content: message.content,
      senderType: message.senderType,
      createdAt: message.createdAt,
      type: message.type,
      files: message.files, // ✅ Send files in socket response
    });

    io.to(finalUserId).emit("receiveMessage", message);

    res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      data: message,
    });
  } catch (error) {
    console.error("❌ Error sending admin message:", error);
    res.status(500).json({ message: "Error sending admin message", error });
  }
}

// static async getAdminUserConversations(req: Request, res: Response): Promise<void> {
//   try {
//     const conversations = await MessageModel.aggregate([
//       {
//         $group: {
//           _id: "$sender",
//           lastMessage: { $last: "$$ROOT" },
//         },
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "_id",
//           foreignField: "_id",
//           as: "userDetails",
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           userId: "$_id",
//           userDetails: { $arrayElemAt: ["$userDetails", 0] },
//           lastMessage: 1,
//         },
//       },
//     ]);

//     res.status(200).json({
//       success: true,
//       message: "User conversations retrieved successfully.",
//       data: conversations,
//     });

//     // ✅ Emit full user conversation details to Admin Dashboard
//     io.emit("admin::userList", conversations);
//   } catch (error) {
//     console.error("❌ Error retrieving user conversations:", error);
//     res.status(500).json({ message: "Error retrieving conversations", error });
//   }
// }

static async getAdminUserConversations(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination metadata
    const totalConversations = await MessageModel.aggregate([
      {
        $group: {
          _id: "$sender",
        },
      },
    ]);

    const totalPages = Math.ceil(totalConversations.length / limit);

    // Fetch paginated conversations
    const conversations = await MessageModel.aggregate([
      {
        $group: {
          _id: "$sender",
          lastMessage: { $last: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          userDetails: { $arrayElemAt: ["$userDetails", 0] },
          lastMessage: 1,
        },
      },
      { $skip: skip },
      { $limit: limit },
    ]);

    res.status(200).json({
      success: true,
      message: "User conversations retrieved successfully.",
      data: conversations,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        pageSize: limit,
        totalConversations: totalConversations.length,
      },
    });

    // ✅ Emit paginated conversation data to Admin Dashboard
    io.emit("admin::userList", conversations);

  } catch (error) {
    console.error("❌ Error retrieving user conversations:", error);
    res.status(500).json({ message: "Error retrieving conversations", error });
  }
}



static async sendVoiceMessage(req: Request, res: Response): Promise<void> {
    try {
      console.log("✅ Incoming Request Body:", req.body);
      console.log("✅ Incoming Voice File:", req.file);

      const { receiverId, senderType } = req.body;

      // Validate if a voice file is uploaded
      if (!req.file) {
         res.status(400).json({ message: "Voice message file is required." });
         return
      }

      let finalReceiverId = receiverId;

      // If sender is a user and no receiver ID is given, send to the first admin
      if (!receiverId && senderType === "user") {
        const admin = await AdminModel.findOne();
        if (!admin) {
           res.status(500).json({ message: "Admin not found." });
           return
        }
        finalReceiverId = admin._id.toString();
      }

      // If sender is an admin and no user ID is provided
      if (!receiverId && senderType === "admin") {
         res.status(400).json({ message: "User ID is required for admin messages." });
         return
      }

      // Process file URL
      const voiceFileUrl = `/uploads/voiceMessages/${req.file.filename}`;

      // Save the message
      const message = new MessageModel({
        sender: req.user ? req.user.id : null,
        receiver: finalReceiverId,
        content: "[Voice Message]",
        senderType,
        isRead: false,
        files: [voiceFileUrl] // Store voice file URL
      });

      await message.save();

      // Emit real-time update via WebSocket
      io.emit(`message::${finalReceiverId}`, {
        content: "[Voice Message]",
        senderType: message.senderType,
        createdAt: message.createdAt,
        files: message.files
      });

      io.to(finalReceiverId).emit("receiveMessage", message);

      res.status(201).json({
        success: true,
        message: "Voice message sent successfully.",
        data: message
      });
    } catch (error) {
      console.error("❌ Error sending voice message:", error);
      res.status(500).json({ message: "Error sending voice message", error });
    }
  }

  static async uploadAttachments(req: Request, res: Response): Promise<void> {
    try {
      console.log("✅ Incoming Files:", req.files);

      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
         res.status(400).json({ message: "At least one attachment is required." });
         return
      }

      // Process file URLs
      const fileUrls = (req.files as Express.Multer.File[]).map(file => `/uploads/attachments/${file.filename}`);

      res.status(201).json({
        success: true,
        message: "Attachments uploaded successfully.",
        files: fileUrls
      });
    } catch (error) {
      console.error("❌ Error uploading attachments:", error);
      res.status(500).json({ message: "Error uploading attachments", error });
    }
  }

  // static async getAllUserMessages(req: Request, res: Response): Promise<void> {
  //   try {
  //     // Check if the request is from an admin
  //     if (!req.user || !req.user.id) {
  //       res.status(403).json({ message: "Unauthorized access" });
  //       return;
  //     }
  //     const admin = await AdminModel.findById(req.user.id);
  //     if (!admin) {
  //       res.status(403).json({ message: "Access denied. Only admins can view messages." });
  //       return;
  //     }
  
  //     // Fetch all users who have sent messages
  //     const usersWithMessages = await MessageModel.aggregate([
  //       {
  //         $group: {
  //           _id: "$sender", // Group messages by sender (user)
  //           messages: {
  //             $push: {
  //               _id: "$_id",
  //               content: "$content",
  //               type: "$type",
  //               files: "$files", // Include images, PDFs, voice messages
  //               senderType: "$senderType",
  //               createdAt: "$createdAt",
  //             },
  //           },
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: "users",
  //           localField: "_id",
  //           foreignField: "_id",
  //           as: "userDetails",
  //         },
  //       },
  //       { $unwind: "$userDetails" }, // Get user details
  //       { $sort: { "messages.createdAt": -1 } }, // Sort messages (latest first)
  //     ]);
  
  //     // Process each user’s messages to separate attachments & voice messages
  //     const formattedData = usersWithMessages.map(user => ({
  //       _id: user._id,
  //       userDetails: user.userDetails,
  //       messages: user.messages.map((msg: { _id: any; content: any; senderType: any; type: any, createdAt: any; files: any[]; }) => ({
  //         _id: msg._id,
  //         content: msg.content,
  //         senderType: msg.senderType,
  //         type: msg.type,
  //         createdAt: msg.createdAt,
  //         attachments: msg.files?.filter(file => !file.includes(".mp3") && !file.includes(".wav") && !file.includes(".m4a") && !file.includes(".ogg")) || [],
  //         voiceMessages: msg.files?.filter(file => file.includes(".mp3") || file.includes(".wav") || file.includes(".m4a") || file.includes(".ogg")) || [],
  //       })),
  //     }));
  
  //     res.status(200).json({
  //       success: true,
  //       message: "User messages retrieved successfully.",
  //       data: formattedData,
  //     });
  //   } catch (error) {
  //     console.error("❌ Error retrieving user messages:", error);
  //     res.status(500).json({ message: "Error retrieving messages", error });
  //   }
  // }
  
  static async getAllUserMessages(req: Request, res: Response): Promise<void> {
    try {
        // Check if the request is from an admin
        if (!req.user || !req.user.id) {
            res.status(403).json({ message: "Unauthorized access" });
            return;
        }
        const admin = await AdminModel.findById(req.user.id);
        if (!admin) {
            res.status(403).json({ message: "Access denied. Only admins can view messages." });
            return;
        }

        // Fetch all users who have sent messages, sorting by last message timestamp
        const usersWithMessages = await MessageModel.aggregate([
            {
                $sort: { createdAt: -1 }, // ✅ Sort messages by latest first
            },
            {
                $group: {
                    _id: "$sender", // Group messages by sender (user)
                    lastMessage: { $first: "$$ROOT" }, // ✅ Get the last message per user
                    messages: { $push: "$$ROOT" }, // Store all messages for this user
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userDetails",
                },
            },
            { $unwind: "$userDetails" }, // Get user details
        ]);

        // ✅ Process messages to separate attachments & voice messages
        const formattedData = usersWithMessages.map(user => ({
            _id: user._id,
            userDetails: user.userDetails,
            lastMessage: {
                _id: user.lastMessage._id,
                content: user.lastMessage.content,
                senderType: user.lastMessage.senderType,
                type: user.lastMessage.type || "text",
                createdAt: user.lastMessage.createdAt,
                attachments: user.lastMessage.files?.filter((file: string | string[]) => !file.includes(".mp3") && !file.includes(".wav") && !file.includes(".m4a") && !file.includes(".ogg")) || [],
                voiceMessages: user.lastMessage.files?.filter((file: string | string[]) => file.includes(".mp3") || file.includes(".wav") || file.includes(".m4a") || file.includes(".ogg")) || [],
            },
            messages: user.messages.map((msg: { _id: any; content: any; senderType: any; type: any; createdAt: any; files: any[] }) => ({
                _id: msg._id,
                content: msg.content,
                senderType: msg.senderType,
                type: msg.type || "text",
                createdAt: msg.createdAt,
                attachments: msg.files?.filter(file => !file.includes(".mp3") && !file.includes(".wav") && !file.includes(".m4a") && !file.includes(".ogg")) || [],
                voiceMessages: msg.files?.filter(file => file.includes(".mp3") || file.includes(".wav") || file.includes(".m4a") || file.includes(".ogg")) || [],
            })),
        }));

        // ✅ Emit user details & conversation to Admin WebSocket
        io.emit("admin::userMessages", formattedData);

        res.status(200).json({
            success: true,
            message: "User messages retrieved successfully.",
            data: formattedData,
        });

    } catch (error) {
        console.error("❌ Error retrieving user messages:", error);
        res.status(500).json({ message: "Error retrieving messages", error });
    }
}



  static async getUserConversationByAdmin(req: Request, res: Response): Promise<void> {
    try {
        if (!req.user || req.user.role !== "admin") {
            res.status(403).json({ message: "Unauthorized access. Admins only." });
            return;
        }

        const { userId } = req.params;

        if (!userId) {
            res.status(400).json({ message: "User ID is required." });
            return;
        }

        // Validate user existence
        const user = await UserModel.findById(userId).select("username email");
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }

        // Pagination settings
        const page = parseInt(req.query.page as string) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        // Fetch user messages with pagination
        const conversation = await MessageModel.find({
            $or: [
                { sender: userId },
                { receiver: userId },
            ],
        })
        .sort({ createdAt: -1 }) // Latest messages first
        .skip(skip)
        .limit(limit)
        .select("_id sender receiver content senderType isRead createdAt updatedAt type files"); // ✅ Ensure `type` is included

        // ✅ Process messages to categorize attachments & voice messages
        const formattedMessages = conversation.map(msg => ({
            _id: msg._id,
            content: msg.content,
            senderType: msg.senderType,
            type: msg.type || "text", // ✅ Ensure `type` is always present
            createdAt: msg.createdAt,
            attachments: msg.files?.filter(file => !file.includes(".mp3") && !file.includes(".wav") && !file.includes(".m4a") && !file.includes(".ogg")) || [],
            voiceMessages: msg.files?.filter(file => file.includes(".mp3") || file.includes(".wav") || file.includes(".m4a") || file.includes(".ogg")) || [],
        }));

        const totalMessages = await MessageModel.countDocuments({
            $or: [
                { sender: userId },
                { receiver: userId },
            ],
        });

        res.status(200).json({
            success: true,
            message: "User conversation retrieved successfully.",
            data: formattedMessages,  // ✅ Return processed messages
            userDetails: user,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalMessages / limit),
                pageSize: limit,
                totalMessages,
            },
        });

        // ✅ Emit user details & conversation to Admin WebSocket
        io.emit("admin::userMessages", {
            userId,
            username: user.username,
            email: user.email,
            totalMessages,
            lastMessage: formattedMessages.length > 0 ? formattedMessages[0].content : "No messages yet.",
            messages: formattedMessages, // ✅ Ensuring `type` is included
        });

    } catch (error) {
        console.error("❌ Error retrieving user conversation:", error);
        res.status(500).json({ message: "Error retrieving user conversation", error });
    }
}





}

