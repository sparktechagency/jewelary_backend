import mongoose, { Schema, Document } from "mongoose";

interface ISize extends Document {
  size: string;
  value: string;
  // price: number;
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
    // price: {
    //   type: Number,
    //   required: true,
    //   min: [0, "Price must be a positive number"], // Ensure price is not negative
    // },
    active: { type: Boolean, default: true }, // By default, size is active
  },
  { timestamps: true }
);

const SizeModel = mongoose.model<ISize>("Size", SizeSchema);
export default SizeModel;
