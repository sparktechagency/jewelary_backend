import mongoose, { Schema, Document } from "mongoose";

interface IThickness extends Document {
  thickness: string;
  // price: number;
  active: boolean;
}

const ThicknessSchema: Schema = new Schema(
  {
    thickness: {
      type: String,
      required: [true, "Thickness is required"],
      trim: true, // Removes spaces
    },
    // price: {
    //   type: Number,
    //   required: true,
    //   min: [0, "Price must be a positive number"], // Ensure price is not negative
    // },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ThicknessModel = mongoose.model<IThickness>("Thickness", ThicknessSchema);
export default ThicknessModel;
