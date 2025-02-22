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

import { NextFunction, Request, Response } from 'express';
import { MessageService } from './message.service';
import { MessageModel } from '../../models/message.model';
import { io } from '../../../app';

export class MessageController {
  
  // static getAllMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   try {
  //     const { userId } = req.params;  // Ensure userId is passed as a URL parameter
  
  //     // Validate userId
  //     if (!userId) {
  //       res.status(400).json({ message: "User ID is required." });
  //       return;
  //     }
  
  //     // Fetch messages where userId is either sender or receiver
  //     const messages = await MessageModel.find({
  //       $or: [{ senderId: userId }, { receiverId: userId }],
  //     })
  //       .sort({ createdAt: -1 })  // Sort by date in descending order
  //       .populate("senderId receiverId")  // Populate sender and receiver details
  //       .exec();
  
  //     // Debug: Log the fetched messages
  //     console.log("Fetched Messages:", messages);
  
  //     if (!messages || messages.length === 0) {
  //       res.status(404).json({ message: "No messages found for this user." });
  //       return;
  //     }
  
  //     res.status(200).json({
  //       messages,
  //     });
  //   } catch (error) {
  //     console.error("Error retrieving messages:", error);
  //     res.status(500).json({ message: "Server error" });
  //   }
  // }

  static getAllMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params; // Ensure userId is passed as a URL parameter

      // Validate userId
      if (!userId) {
        res.status(400).json({ message: "User ID is required." });
        return;
      }

      // Fetch messages where userId is either sender or receiver
      const messages = await MessageModel.find({
        $or: [{ sender: userId }, { receiver: userId }],
      })
        .sort({ createdAt: -1 }) // Sort by date in descending order
        .populate('sender receiver') // Populate sender and receiver fields
        .exec();

      if (!messages || messages.length === 0) {
        res.status(404).json({ message: "No messages found for this user." });
        return;
      }

      res.status(200).json({
        messages,
      });
    } catch (error) {
      console.error("Error retrieving messages:", error);
      next(error); // Let Express handle the error
    }
  }



  static async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { receiverId, content, senderType, productId, messageSource } = req.body;

      // Check if required fields are present
      if (!receiverId || !content || !senderType) {
         res.status(400).json({ message: "Missing required fields" });
         return
      }

      // If it's a product page message, ensure productId is provided for users
      if (messageSource === 'productPage' && senderType === 'user' && !productId) {
         res.status(400).json({ message: "Missing productId for product page messages" });
         return
      }

      // If it's a message box message, allow admins or users to send normal messages (without productId)
      if (messageSource === 'messageBox' && senderType === 'user' && productId) {
        console.log("Users should not provide productId for message box messages. Ignoring productId.");
      }

      // Send the message via the MessageService
      const message = await MessageService.sendMessage(receiverId, content, senderType, productId, messageSource);

        // Emit socket event for real-time message delivery
      io.to(receiverId).emit("receiveMessage", message);
      res.status(201).json(message);  // Return the sent message
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Error sending message", error });
    }
  }

  // static async getConversation(req: Request, res: Response): Promise<void> {
  //   try {
  //     if (!req.user || !req.user.id) {
  //        res.status(403).json({ message: "Unauthorized access" });
  //        return
  //     }

  //     const userId = req.user.id;
  //     const partnerId = req.params.partnerId;

  //     // If the logged-in user is an admin, they can access all conversations
  //     if (req.user.role === 'admin') {
  //       const conversation = await MessageService.getConversation(userId, partnerId);
  //        res.json(conversation);  // Return the conversation for the admin
  //        return
  //     }

  //     // If the logged-in user is not an admin, they can only view their own conversations
  //     const conversation = await MessageService.getConversation(userId, partnerId);
    
  //      res.json(conversation);  // Return the conversation for the user
  //   } catch (error) {
  //     console.error("Error retrieving conversation:", error);
  //     res.status(500).json({ message: "Error retrieving conversation", error });
  //   }
  // }

  static async getConversation(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
               res.status(403).json({ message: "Unauthorized access" });
               return
            }
      const userId = req.user.id;
      const partnerId = req.params.partnerId;

      if (!partnerId) {
        res.status(400).json({ message: "Partner ID is required" });
        return;
      }

      const conversation = await MessageService.getConversation(userId, partnerId);
      res.json(conversation);
    } catch (error) {
      console.error("Error retrieving conversation:", error);
      res.status(500).json({ message: "Error retrieving conversation", error });
    }
  }


  static async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;

      if (!messageId) {
         res.status(400).json({ message: "Message ID is required" });
         return
      }

      const message = await MessageService.markAsRead(messageId);
      res.json(message);  // Return the updated message
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Error marking message as read", error });
    }
  }
}
