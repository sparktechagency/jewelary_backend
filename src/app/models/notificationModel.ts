import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  message: string;
  seen: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    seen: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const NotificationModel = mongoose.model<INotification>("Notification", NotificationSchema);
export default NotificationModel;
