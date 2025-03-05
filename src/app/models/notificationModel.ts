import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId?: mongoose.Types.ObjectId;  // ✅ Make userId optional
  message: string;
  orderId?: mongoose.Types.ObjectId; // ✅ Ensure this field exists
  orderStatus?: string; // ✅ Ensure this field exists
  seen: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // ✅ Make optional
    message: { type: String, required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: false }, // ✅ Make optional
    orderStatus: { type: String, required: false }, // ✅ Allow filtering by order status
    seen: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const NotificationModel = mongoose.model<INotification>("Notification", NotificationSchema);
export default NotificationModel;
//   },
//   password: {