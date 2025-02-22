// import mongoose, { Schema, Document } from "mongoose";

// // Define the structure for product attributes
// interface IProductAttribute extends Document {
//   color: string[];
//   size: string[];
//   thickness: string[];
//   quantity: number[];
//   price: number
// }

// const ProductAttributeSchema: Schema = new Schema(
//   {
//     color: { type: [String], required: true }, // Array of colors
//     size: { type: [String], required: true }, // Array of sizes
//     thickness: { type: [String], required: true }, // Array of thicknesses
//     quantity: { type: [Number], required: true }, // Array of quantities
//     price:  { type: [Number], required: true },
//   },
//   {
//     timestamps: true, // Automatically add createdAt and updatedAt fields
//   }
// );

// const ProductAttributeModel = mongoose.model<IProductAttribute>("ProductAttribute", ProductAttributeSchema);
// export default ProductAttributeModel;

import mongoose, { Schema, Document } from "mongoose";

interface IProduct extends Document {
  name: string;
  details: string;
  category: {
    _id: string;
    name: string;
  } | null;
  availableQuantity: number;
  minimumOrderQuantity: number;
  deliveryCharge: number;
  variations: {
    _id: any;
    color: string;
    size: string;
    thickness: string;
    quantity: number;
    price: number;
  }[];
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
