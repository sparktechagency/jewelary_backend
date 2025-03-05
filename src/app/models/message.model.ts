import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  content: string;
  productId?: mongoose.Types.ObjectId; // ✅ Make productId optional
  messageSource: string;
  senderType: 'user' | 'admin';
  isRead: boolean;
  files?: string[]; // ✅ Add files field
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    content: { type: String, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: false }, // ✅ Make productId optional
    messageSource: { type: String, required:false }, // ✅ Ensure this field exists
    senderType: { type: String, enum: ['user', 'admin'], required: true }, // ✅ Ensure it's required
    isRead: { type: Boolean, default: true },
    files: { type: [String], default: [] }, // ✅ Add files field
  },
  { timestamps: true }
);

export const MessageModel = mongoose.model<IMessage>('Message', MessageSchema);

// import mongoose, { Schema, Document } from 'mongoose';

// export interface IMessage extends Document {
//   sender: mongoose.Types.ObjectId;  // sender should be added back
//   receiver: mongoose.Types.ObjectId;
//   content: string;
//   senderType: 'user' | 'admin';
//   isRead: boolean;
//   createdAt: Date;
// }

// const MessageSchema = new Schema<IMessage>(
//   {
//     sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Add sender field
//     receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     content: { type: String, required: true },
//     senderType: { type: String, enum: ['user', 'admin'], required: true },
//     isRead: { type: Boolean, default: false },
//   },
//   { timestamps: true }
// );

// export const MessageModel = mongoose.model<IMessage>('Message', MessageSchema);
