// import mongoose, { Schema, Document } from "mongoose";

import mongoose, { Schema } from "mongoose";

interface IProduct extends Document {
  name: string;
  details: string;
  // category: string;
  category: {
    _id: string;
    name: string;
  } | null;
  availableQuantity: number;
  minimumOrderQuantity: number;
  deliveryCharge: number,
  attributeOptions: mongoose.Schema.Types.ObjectId; // Reference to ProductAttribute
  variations: {
    _id: any;
  
    color: string;
    size: string;
    thickness: string;
    quantity: number;
    price: number;
  }[];
}


const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    details: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // ✅ Ensure correct reference
      required: true,
    },
    availableQuantity: { type: Number, required: true },
    minimumOrderQuantity: { type: Number, required: true },
    deliveryCharge: { type: Number, required: true },
    attributeOptions: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductAttribute",
      required: true,
    },
    variations: [
      {
        color: { type: String, required: true },
        size: { type: String, required: true },
        thickness: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    imageUrls: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

const ProductModel = mongoose.model<IProduct>("Product", ProductSchema);
export default ProductModel;
