import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  // sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  content: string;
  senderType: 'user' | 'admin';
  isRead: boolean;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    // sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    senderType: { type: String, enum: ['user', 'admin'], required: true }, // ✅ Ensure it's required
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const MessageModel = mongoose.model<IMessage>('Message', MessageSchema);