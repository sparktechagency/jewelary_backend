import { Request, Response } from 'express';
import { MessageService } from './message.service';

export class MessageController {
  static async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      console.log("Received Request Body:", req.body); // Debugging log
      const { receiverId, content, senderType, productId } = req.body;
      

      if (!receiverId || !content || !senderType) {
        res.status(400).json({ message: "Missing required fields" });
        return;
      }

      const message = await MessageService.sendMessage(receiverId, content, senderType, productId);
      res.status(201).json(message); // ✅ No explicit `return`
        } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Error sending message", error });
    }
  }



  static async getConversation(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
        res.status(403).json({ message: "Unauthorized access" });
        return;
      }

      const userId = req.user.id;
      const partnerId = req.params.partnerId;

      const conversation = await MessageService.getConversation(userId, partnerId);
      res.json(conversation); // ✅ No explicit `return`
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
        return;
      }

      const message = await MessageService.markAsRead(messageId);
      res.json(message); // ✅ No explicit `return`
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Error marking message as read", error });
    }
  }
}