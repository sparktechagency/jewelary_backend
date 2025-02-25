// import mongoose, { Schema, Document } from "mongoose";

// interface IColor extends Document {
//   colorName: string;
//   colorCode: string;
//   active: boolean;
// }

// const ColorSchema: Schema = new Schema(
//   {
//     color: {
//       type: String,
//       required: true,
//       unique: true,
//       validate: {
//         validator: function (value: string) {
//           return value !== null && value.trim() !== "";  // Prevent empty or null color values
//         },
//         message: "Color cannot be null or empty.",
//       },
//     },
//     active: { type: Boolean, default: true },  // By default, color is active
//   },
//   { timestamps: true }
// );

// const ColorModel = mongoose.model<IColor>("Color", ColorSchema);
// export default ColorModel;


import mongoose, { Schema, Document } from "mongoose";

// Define the structure for the color document
interface IColor extends Document {
  colorName: string;
  colorCode: string;
  // price: number;
  active: boolean;
}

const ColorSchema: Schema = new Schema(
  {
    colorName: {  // Changed field name to colorName to match the interface
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (value: string) {
          return value !== null && value.trim() !== "";  // Prevent empty or null color names
        },
        message: "Color name cannot be null or empty.",
      },
    },
    colorCode: {  // Assuming you'd want a colorCode field as well
      type: String,
      required: true,
      unique: true,
      validate: {
        // Validate color code format (example: hex color code)
        validator: function (value: string) {
          return value !== null && value.trim() !== ""; 
        },
        message: "This are only String.",
      },
    },
    // price: {
    //   type: Number,
    //   required: true,
    //   min: [0, "Price must be a positive number"], // Ensure price is not negative
    // },
    active: { type: Boolean, default: true },  // By default, color is active
  },
  { timestamps: true }
);

const ColorModel = mongoose.model<IColor>("Color", ColorSchema);
export default ColorModel;
