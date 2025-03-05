// // import { MessageModel, IMessage } from '../../models/message.model';

// // export class MessageService {
// // static async sendMessage(
// //   receiverId: string,
// //   content: string,
// //   senderType: "user" | "admin",
// //   productId: string
// // ): Promise<IMessage> {
// //   const message = new MessageModel({ receiver: receiverId, content, senderType, productId });
// //   return message.save();
// // }


// //   static async getConversation(userId: string, partnerId: string): Promise<IMessage[]> {
// //     return MessageModel.find({
// //       $or: [
// //         { sender: userId, receiver: partnerId },
// //         { sender: partnerId, receiver: userId }
// //       ]
// //     }).sort({ createdAt: 1 });
// //   }
  
// // //   static async getConversation(userId: string, partnerId: string): Promise<IMessage[]> {
// // //     const messages = await MessageModel.find({
// // //         $or: [
// // //             { sender: userId, receiver: partnerId },
// // //             { sender: partnerId, receiver: userId }
// // //         ]
// // //     }).sort({ createdAt: 1 });

// // //     console.log("Fetched Messages:", messages); // Debugging
// // //     return messages;
// // // }


// //   static async markAsRead(messageId: string) {
// //     return MessageModel.findByIdAndUpdate(messageId, { isRead: true }, { new: true });
// //   }
// // }

// import { MessageModel, IMessage } from '../../models/message.model';

// export class MessageService {
//   // Send a message and save it in the database
//   static async sendMessage(
//     receiverId: string,
//     content: string,
//     senderType: "user" | "admin",
//     productId: string | null,
//     messageSource: string
//   ): Promise<IMessage> {
//     // Validate productId based on message source (only for user messages from productPage)
//     const productIdToSave = messageSource === "productPage" && senderType === "user" ? productId : null;

//     const message = new MessageModel({
//       receiver: receiverId,
//       content,
//       senderType,
//       productId: productIdToSave,  // Only add productId for users from product page
//       messageSource
//     });

//     return message.save();  // Save and return the created message
//   }

//   // Get all messages in a conversation between userId and partnerId
//   static async getConversation(userId: string, partnerId: string): Promise<IMessage[]> {
//     // Retrieve messages between the user and the partner (user or admin)
//     return MessageModel.find({
//       $or: [
//         { sender: userId, receiver: partnerId },
//         { sender: partnerId, receiver: userId }
//       ]
//     }).sort({ createdAt: 1 });  // Sort messages by createdAt (ascending order)
//   }

//   // Get all messages in the system (for admin)
//   static async getAllMessages(): Promise<IMessage[]> {
//     // Admin can view all messages
//     return MessageModel.find().sort({ createdAt: 1 });  // Sort all messages by createdAt
//   }

//   // Mark message as read by updating isRead field
//   static async markAsRead(messageId: string) {
//     return MessageModel.findByIdAndUpdate(messageId, { isRead: true }, { new: true });
//   }
// }
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
