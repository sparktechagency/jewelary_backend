// import mongoose, { Document, Schema } from "mongoose";

// interface IPayment extends Document {
//   userId: mongoose.Schema.Types.ObjectId;
//   orderId: mongoose.Schema.Types.ObjectId;
//   amount: number;
//   paidAmount: number;
//   dueAmount: number;
//   paymentType: "full" | "partial" | "cod";
//   paymentIntentId?: string;
//   status: "pending" | "partial" | "Paid" | "failed"; // ✅ Fixed status values
//   createdAt: Date;
// }

// const PaymentSchema = new Schema<IPayment>({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
//   amount: { type: Number, required: true },
//   paidAmount: { type: Number, required: true },
//   dueAmount: { type: Number, required: true },
//   paymentType: { type: String, enum: ["full", "partial", "cod"], required: true },
//   paymentIntentId: { type: String },
//   status: { type: String, enum: ["pending", "partial", "Paid", "failed"], default: "pending" }, // ✅ Fixed Enum
//   createdAt: { type: Date, default: Date.now },
// });

// const PaymentModel = mongoose.model<IPayment>("Payment", PaymentSchema);
// export default PaymentModel;


import mongoose, { Document, Schema } from "mongoose";

interface IPayment extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  orderId: mongoose.Schema.Types.ObjectId;
  amount: number;
  paidAmount: number;
  dueAmount: number;
  paymentType: "full" | "partial" | "cod";
  paymentIntentId?: string;
  status: "pending" | "partial" | "Paid" | "succeeded" | "failed"; // Add "succeeded" to the status
  createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  amount: { type: Number, required: true },
  paidAmount: { type: Number, required: true },
  dueAmount: { type: Number, required: true },
  paymentType: { type: String, enum: ["full", "partial", "cod"], required: true },
  paymentIntentId: { type: String },
  status: { type: String, enum: ["pending", "partial", "Paid", "succeeded", "failed"], default: "pending" }, // Added "succeeded"
  createdAt: { type: Date, default: Date.now },
});

const PaymentModel = mongoose.model<IPayment>("Payment", PaymentSchema);
export default PaymentModel;
