import mongoose, { Document, Schema } from "mongoose";

interface IOrder extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  items: {
    variationsId: any;
    toObject(): any; 
    productId: mongoose.Schema.Types.ObjectId; 
    quantity: number; 
    color: string;  // Add color here
  }[];
  contactName: string;
  contactNumber: string;
  deliverTo: string;
  totalAmount: number;
  paidAmount: number;
  receipts: string[];
  receiptUrls: string[];
  dueAmount: number;
  paymentStatus: "Pending" | "Partial" | "Paid";
  orderStatus: "pending" | "running" | "completed" | "custom" | "cancelled";
  createdAt: Date;
}
// const OrderSchema = new Schema<IOrder>({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   items: [
//     {
//       productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
//       quantity: { type: Number, required: true },
//     },
//   ],

//   contactName: { type: String, required: true },
//   contactNumber: { type: String, required: true },
//   deliverTo: { type: String, required: true },
//   totalAmount: { type: Number, required: true },
//   paidAmount: { type: Number, required: true, default: 0 },
//   receiptUrls: [{ type: String }], // Changed from receipts to receiptUrls
//   receipts: [{ type: String }], // Changed from Buffer to String
//   dueAmount: { type: Number, required: true },
//   paymentStatus: { type: String, enum: ["Pending", "Partial", "Paid"], default: "Pending" },
//   orderStatus: { type: String, enum: ["pending", "running", "completed", "custom", "cancelled"], default: "pending" },
//   createdAt: { type: Date, default: Date.now },
// });
const OrderSchema: Schema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        color: { type: String, required: true },  // Add color as a required field
      }
    ],
    contactName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    deliverTo: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, required: true },
    receipts: [{ type: String }],
    receiptUrls: [{ type: String }],
    dueAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ["Pending", "Partial", "Paid"], required: true },
    orderStatus: { type: String, enum: ["pending", "running", "completed", "custom", "cancelled"], required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const OrderModel = mongoose.model<IOrder>("Order", OrderSchema);
export default OrderModel;