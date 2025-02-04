import mongoose, { Document, Schema } from "mongoose";

interface IPayment extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  amount: number;
  paymentIntentId: string;
  status: string;
  createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  paymentIntentId: { type: String, required: true },
  status: { type: String, enum: ["pending", "succeeded", "failed"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

const PaymentModel = mongoose.model<IPayment>("Payment", PaymentSchema);

export default PaymentModel;
