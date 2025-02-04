import { Document, Types, Model } from 'mongoose';

export interface IMessage extends Document {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  content: string;
  senderType: 'user' | 'admin';
  readStatus: boolean;
  attachments?: string[];
}



export interface IMessage {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  content: string;
  senderType: 'user' | 'admin';
  readStatus: boolean;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessageDocument extends IMessage, Document {}

export interface IMessageMethods {
  markAsRead(): Promise<IMessageDocument>;
}

export interface IMessageModel extends Model<IMessageDocument, {}, IMessageMethods> {
  getConversation(userId: string, partnerId: string): Promise<IMessageDocument[]>;
  getUnreadCount(userId: string): Promise<number>;
}
export interface MessageDocument extends Document, IMessage {}