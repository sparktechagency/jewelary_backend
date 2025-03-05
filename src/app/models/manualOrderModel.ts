import mongoose, { Schema, Document } from "mongoose";

export interface IManualOrder extends Document {
  orderNo: string;
  date: Date;
  customerName: string;
  amount: number;
  createdAt: Date;
}

const ManualOrderSchema: Schema = new Schema(
  {
    orderNo: { type: String, required: true, unique: true }, // Ensure unique order numbers
    date: { type: Date, required: true }, // Order date
    customerName: { type: String, required: true },
    amount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ManualOrderModel = mongoose.model<IManualOrder>("ManualOrder", ManualOrderSchema);
export default ManualOrderModel;
