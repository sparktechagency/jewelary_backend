import { MessageModel, IMessage } from '../../models/message.model';

export class MessageService {
//   static async sendMessage(
// // senderId: string,
// receiverId: string, content: string, senderType: 'user' | 'admin', productId: any  ): Promise<IMessage> {
//     const message = new MessageModel({ receiver: receiverId, content, senderType });
//     return message.save();
//   }
static async sendMessage(
  receiverId: string,
  content: string,
  senderType: "user" | "admin",
  productId: string
): Promise<IMessage> {
  const message = new MessageModel({ receiver: receiverId, content, senderType, productId });
  return message.save();
}


  static async getConversation(userId: string, partnerId: string): Promise<IMessage[]> {
    return MessageModel.find({
      $or: [
        { sender: userId, receiver: partnerId },
        { sender: partnerId, receiver: userId }
      ]
    }).sort({ createdAt: 1 });
  }

  static async markAsRead(messageId: string) {
    return MessageModel.findByIdAndUpdate(messageId, { isRead: true }, { new: true });
  }
}