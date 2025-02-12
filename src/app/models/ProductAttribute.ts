import mongoose, { Schema, Document } from "mongoose";

// Define the structure for product attributes
interface IProductAttribute extends Document {
  color: string[];
  size: string[];
  thickness: string[];
  quantity: number[];
  price: number
}

const ProductAttributeSchema: Schema = new Schema(
  {
    color: { type: [String], required: true }, // Array of colors
    size: { type: [String], required: true }, // Array of sizes
    thickness: { type: [String], required: true }, // Array of thicknesses
    quantity: { type: [Number], required: true }, // Array of quantities
    price:  { type: [Number], required: true },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

const ProductAttributeModel = mongoose.model<IProductAttribute>("ProductAttribute", ProductAttributeSchema);
export default ProductAttributeModel;
