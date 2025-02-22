import mongoose, { Schema, Document } from "mongoose";

interface IThickness extends Document {
  thickness: string;
}

const ThicknessSchema: Schema = new Schema(
  {
    thickness: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function(value: string) {
          return value !== null && value.trim() !== "";  // Prevent empty or null thickness values
        },
        message: "Thickness cannot be null or empty.",
      },
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);


const ThicknessModel = mongoose.model<IThickness>("Thickness", ThicknessSchema);
export default ThicknessModel;
