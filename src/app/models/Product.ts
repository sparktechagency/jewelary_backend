// import mongoose, { Schema, Document } from "mongoose";

import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  details: string;
  category: mongoose.Types.ObjectId;
  availableQuantity: number;
  minimumOrderQuantity: number;
  deliveryCharge: number;
  price: number;
  colors: mongoose.Types.ObjectId[];
  sizes: mongoose.Types.ObjectId[];
  thicknesses: mongoose.Types.ObjectId[];
  imageUrls: string[];
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    details: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    availableQuantity: { type: Number, required: true },
    minimumOrderQuantity: { type: Number, required: true },
    deliveryCharge: { type: Number, required: true },
    price: { type: Number, required: true },
    colors: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Color", required: true }
    ],
    sizes: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Size", required: true }
    ],
    thicknesses: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Thickness", required: true }
    ],
    imageUrls: [{ type: String }],
  },
  { timestamps: true }
);

const ProductModel = mongoose.model<IProduct>("Product", ProductSchema);
export default ProductModel;

