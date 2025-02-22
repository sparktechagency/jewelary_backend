import mongoose, { Schema, Document } from "mongoose";

interface ISize extends Document {
  size: string;
  active: boolean;
}

const SizeSchema: Schema = new Schema(
  {
    size: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (value: string) {
          return value !== null && value.trim() !== ""; // Prevent empty or null size values
        },
        message: "Size cannot be null or empty.",
      },
    },
    value: {
      type: String,
      required: true,
      unique: true,
      default: function (this: ISize) {
        return this.size;
      },
    },
    active: { type: Boolean, default: true }, // By default, size is active
  },
  { timestamps: true }
);

const SizeModel = mongoose.model<ISize>("Size", SizeSchema);
export default SizeModel;
