// import mongoose, { Schema, Document } from "mongoose";

// import mongoose, { Schema, Document } from "mongoose";

// export interface IProduct extends Document {
//   name: string;
//   details: string;
//   category: mongoose.Types.ObjectId;
//   availableQuantity: number;
//   minimumOrderQuantity: number;
//   deliveryCharge: number;
//   price: number;
//   colors: mongoose.Types.ObjectId[];
//   sizes: mongoose.Types.ObjectId[];
//   thicknesses: mongoose.Types.ObjectId[];
//   file: string[];
// }

// const ProductSchema: Schema = new Schema(
//   {
//     name: { type: String, required: true },
//     details: { type: String, required: true },
//     category: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Category",
//       required: true,
//     },
//     availableQuantity: { type: Number, required: true },
//     minimumOrderQuantity: { type: Number, required: true },
//     deliveryCharge: { type: Number, required: true },
//     price: { type: Number, required: true },
//     colors: [
//       { type: mongoose.Schema.Types.ObjectId, ref: "Color", required: true }
//     ],
//     sizes: [
//       { type: mongoose.Schema.Types.ObjectId, ref: "Size", required: true }
//     ],
//     thicknesses: [
//       { type: mongoose.Schema.Types.ObjectId, ref: "Thickness", required: true }
//     ],
//     file: [{ type: String }],
//   },
//   { timestamps: true }
// );

// const ProductModel = mongoose.model<IProduct>("Product", ProductSchema);
// export default ProductModel;


import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  details: string;
  category: mongoose.Types.ObjectId;  // Should be an ObjectId, not embedded category object
  availableQuantity: number;
  minimumOrderQuantity: number;
  deliveryCharge: number;
  file: string[];
  active: boolean;
  variations: {
    color: mongoose.Types.ObjectId;
    size: mongoose.Types.ObjectId;
    // thickness: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
  }[];
  createdAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    details: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },  // Should reference CategoryModel
    availableQuantity: { type: Number, required: false },
    minimumOrderQuantity: { type: Number, required: true },
    deliveryCharge: { type: Number, required: true },
    file: [{ type: String }],
    active: { type: Boolean, default: true },
    variations: [
      {
        color: { type: mongoose.Schema.Types.ObjectId, ref: "Color", required: true },
        size: { type: mongoose.Schema.Types.ObjectId, ref: "Size", required: true },
        // thickness: { type: mongoose.Schema.Types.ObjectId, ref: "Thickness", required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ProductModel = mongoose.model<IProduct>("Product", ProductSchema);
export default ProductModel;
