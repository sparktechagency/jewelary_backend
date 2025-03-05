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

export class MessageController {
  static getAllMessages(arg0: string, isAuthenticated: (req: import("../../../types/express").AuthRequest, res: Response, next: NextFunction) => void, getAllMessages: any) {
      throw new Error('Method not implemented.');
  }

  // static async sendMessage(req: Request, res: Response): Promise<void> {
  //   try {
  //     const { receiverId, content, senderType, productId, messageSource } = req.body;
    
  //     if (!receiverId || !content || !senderType) {
  //       res.status(400).json({ message: "Missing required fields" });
  //       return;
  //     }

  //     const finalProductId = (messageSource === 'productPage' && senderType === 'user')
  //       ? productId
  //       : null;

  //     const message = await MessageService.sendMessage(receiverId, content, senderType, finalProductId, messageSource);

  //     // Emit socket event to notify receiver in real-time
  //     io.emit(`message::${receiverId}`, {
  //       content: message.content,
  //       senderType: message.senderType,
  //       createdAt: message.createdAt,
  //     });
  //     io.to(receiverId).emit("receiveMessage", message);

  //     res.status(201).json(message);
  //   } catch (error) {
  //     res.status(500).json({ message: "Error sending message", error });
  //   }
  // }

  static async getConversation(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
        res.status(403).json({ message: "Unauthorized access" });
        return;
      }

      const userId = req.user.id;
      const partnerId = req.params.partnerId;

      if (!partnerId) {
        res.status(400).json({ message: "Partner ID is required" });
        return;
      }

      const conversation = await MessageService.getConversation(userId, partnerId);
      res.status(200).json(conversation);
    } catch (error) {
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


// static async sendAdminMessage(req: Request, res: Response): Promise<void>{
//   try {
//     const { userId, content } = req.body;

//     if (!userId || !content) {
//       res.status(400).json({ message: "User ID and content are required." });
//       return;
//     }

//     const user = await UserModel.findById(userId);
//     if (!user) {
//       res.status(404).json({ message: "User not found." });
//       return;
//     }

//     // You must replace this with your actual Admin User ID from the database
//     const adminUserId = '67c1bb7bb5bc423bfe99c40e';

//     const message = new MessageModel({
//       sender: adminUserId,  // ✅ Use a valid ObjectId of admin
//       receiver: userId,
//       content,
//       senderType: 'admin',
//       isRead: false,
//     });

//     await message.save();

//     io.emit(`message::${userId}`, {
//       content: message.content,
//       senderType: message.senderType,
//       createdAt: message.createdAt,
//     });

//     res.status(201).json({
//       success: true,
//       message: 'Message sent successfully.',
//       data: message,
//     });

//   } catch (error) {
//     console.error('Error sending admin message:', error);
//     res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Internal Server Error' });
//   }
// };

// static async sendMessage(req: Request, res: Response): Promise<void> {
//   try {
//       const { receiverId, content, senderType, productId, messageSource } = req.body;

//       if (!content && !req.files) {
//           res.status(400).json({ message: "Either content or a file is required." });
//           return;
//       }

//       let finalReceiverId = receiverId;

//       // If user sends a message without specifying an admin, assign it to the first admin found
//       if (!receiverId && senderType === 'user') {
//           const admin = await AdminModel.findOne();
//           if (!admin) {
//               res.status(500).json({ message: "Admin not found." });
//               return;
//           }
//           finalReceiverId = admin._id.toString();
//       }

//       // If admin sends a message without specifying a user, return an error
//       if (!receiverId && senderType === 'admin') {
//           res.status(400).json({ message: "User ID is required for admin messages." });
//           return;
//       }

//       // Handle file uploads (Images, PDFs, Voice Messages)
//       let fileUrls: string[] = [];
//       if (req.files) {
//           const uploadedFiles = req.files as Express.Multer.File[];
//           fileUrls = uploadedFiles.map(file => `/uploads/messages/${file.filename}`);
//       }

//       const finalProductId = (messageSource === 'productPage' && senderType === 'user') ? productId : null;

//       const message = await MessageService.sendMessage(finalReceiverId, content, senderType, finalProductId, messageSource, fileUrls);

//       // Emit socket event for real-time updates
//       io.emit(`message::${finalReceiverId}`, {
//           content: message.content,
//           senderType: message.senderType,
//           createdAt: message.createdAt,
//           files: message.files,
//       });

//       io.to(finalReceiverId).emit("receiveMessage", message);

//       res.status(201).json(message);
//   } catch (error) {
//       res.status(500).json({ message: "Error sending message", error });
//   }
// }

static async sendMessage(req: Request, res: Response): Promise<void> {
  try {
      console.log("🔍 Incoming Request Body:", req.body);
      console.log("🔍 Incoming Files:", req.files);

      const { receiverId, content, senderType, productId, messageSource } = req.body;

      // Ensure Multer properly processes the files
      let fileUrls: string[] = [];
      if (req.files && Array.isArray(req.files)) {
          fileUrls = req.files.map((file: Express.Multer.File) => `/uploads/messages/${file.filename}`);
      } else if (req.files && typeof req.files === 'object') {
          Object.values(req.files).forEach((fileArray) => {
              (fileArray as Express.Multer.File[]).forEach(file => {
                  fileUrls.push(`/uploads/messages/${file.filename}`);
              });
          });
      }

      console.log("✅ Extracted File URLs:", fileUrls);

      // Ensure at least content or a file is provided
      if (!content && fileUrls.length === 0) {
           res.status(400).json({ message: "Either content or a file is required." });
           return
      }

      let finalReceiverId = receiverId;

      // If sender is a user and receiver isn't set, send to first admin
      if (!receiverId && senderType === 'user') {
          const admin = await AdminModel.findOne();
          if (!admin) {
               res.status(500).json({ message: "Admin not found." });
               return
          }
          finalReceiverId = admin._id.toString();
      }

      // If sender is an admin and userId isn't provided
      if (!receiverId && senderType === 'admin') {
           res.status(400).json({ message: "User ID is required for admin messages." });
           return
      }

      const finalProductId = (messageSource === 'productPage' && senderType === 'user') ? productId : null;

      // Save message to database
      const message = new MessageModel({
          sender: req.user ? req.user.id : null,
          receiver: finalReceiverId,
          content,
          senderType,
          productId: finalProductId,
          messageSource,
          files: fileUrls, // ✅ Storing files in DB
          isRead: false
      });

      await message.save();

      console.log("📩 Message Saved:", message);

      // Emit real-time update via WebSocket
      io.emit(`message::${finalReceiverId}`, {
          content: message.content,
          senderType: message.senderType,
          createdAt: message.createdAt,
          files: message.files, // ✅ Send files in socket response
      });

      io.to(finalReceiverId).emit("receiveMessage", message);

      res.status(201).json(message);
  } catch (error) {
      console.error("❌ Error sending message:", error);
      res.status(500).json({ message: "Error sending message", error });
  }
}



static async sendAdminMessage(req: Request, res: Response): Promise<void> {
  try {
      const { userId, content } = req.body;

      if (!content && !req.files) {
          res.status(400).json({ message: "Content or a file is required." });
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

      // Handle file uploads (Images, PDFs, Voice Messages)
      let fileUrls: string[] = [];
      if (req.files) {
          const uploadedFiles = req.files as Express.Multer.File[];
          fileUrls = uploadedFiles.map(file => `/uploads/messages/${file.filename}`);
      }

      const message = new MessageModel({
          sender: admin._id,
          receiver: finalUserId,
          content,
          senderType: 'admin',
          isRead: false,
          files: fileUrls,
      });

      await message.save();

      io.emit(`message::${finalUserId}`, {
          content: message.content,
          senderType: message.senderType,
          createdAt: message.createdAt,
          files: message.files,
      });

      res.status(201).json({
          success: true,
          message: "Message sent successfully.",
          data: message,
      });

  } catch (error) {
      console.error("Error sending admin message:", error);
      res.status(500).json({ success: false, message: error instanceof Error ? error.message : "Internal Server Error" });
  }
}

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
           return
      }

      // Fetch all users who have sent messages
      const usersWithMessages = await MessageModel.aggregate([
          {
              $group: {
                  _id: "$sender", // Group messages by sender (user)
                  messages: {
                      $push: {
                          _id: "$_id",
                          content: "$content",
                          files: "$files",
                          senderType: "$senderType",
                          createdAt: "$createdAt"
                      }
                  }
              }
          },
          {
              $lookup: {
                  from: "users",
                  localField: "_id",
                  foreignField: "_id",
                  as: "userDetails"
              }
          },
          { $unwind: "$userDetails" }, // Get user details
          { $sort: { "messages.createdAt": -1 } } // Sort messages (latest first)
      ]);

      res.status(200).json({
          success: true,
          message: "User messages retrieved successfully.",
          data: usersWithMessages,
      });
  } catch (error) {
      console.error("❌ Error retrieving user messages:", error);
      res.status(500).json({ message: "Error retrieving messages", error });
  }
}



}

