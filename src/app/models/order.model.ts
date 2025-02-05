import mongoose, { Document, Schema } from "mongoose";

interface IOrder extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  items: { productId: mongoose.Schema.Types.ObjectId; quantity: number }[];
  totalAmount: number;
  paidAmount: number;
  receipts: string[];
  receiptUrls: string[];
  dueAmount: number;
  paymentStatus: "Pending" | "Partial" | "Paid";
  orderStatus: "pending" | "accepted" | "shipped" | "delivered" | "cancelled";
  createdAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, required: true, default: 0 },
  receiptUrls: [{ type: String }], // Changed from receipts to receiptUrls
  receipts: [{ type: String }], // Changed from Buffer to String
  dueAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ["Pending", "Partial", "Paid"], default: "Pending" },
  orderStatus: { type: String, enum: ["pending", "accepted", "shipped", "delivered", "cancelled"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

const OrderModel = mongoose.model<IOrder>("Order", OrderSchema);
export default OrderModel;