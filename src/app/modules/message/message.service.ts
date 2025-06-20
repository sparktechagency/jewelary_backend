import mongoose from 'mongoose';
import { MessageModel, IMessage } from '../../models/message.model';

export class MessageService {

  static async sendMessage(
receiverId: string, content: string, senderType: "user" | "admin", productId: string | null, messageSource: string, fileUrls: string[]  ): Promise<IMessage> {
    const messageData: Partial<IMessage> = {
      receiver: new mongoose.Types.ObjectId(receiverId),
      sender: senderType === 'user' ? new mongoose.Types.ObjectId(receiverId) : undefined, // Adjust based on your authentication logic
      content,
      senderType,
      productId: productId ? new mongoose.Types.ObjectId(productId) : undefined,
      messageSource,
      isRead: false,
    };

    const message = new MessageModel(messageData);
    return message.save();
  }

  static async getConversation(userId: string, partnerId: string): Promise<IMessage[]> {
    return MessageModel.find({
      $or: [
        { sender: userId, receiver: partnerId },
        { sender: partnerId, receiver: userId }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender receiver productId');
  }

  static async markAsRead(messageId: string) {
    return MessageModel.findByIdAndUpdate(messageId, { isRead: true }, { new: true });
  }
}
