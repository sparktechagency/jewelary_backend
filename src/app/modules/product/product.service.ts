// Product.service.ts 

import { Types } from "mongoose";
import ProductModel from "../../models/Product";  // Use default import

export const ProductService = {
  create: async (productData: any) => {
    try {
      const product = await ProductModel.create(productData);
      return product;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error("Error creating product: " + error.message);
      } else {
        throw new Error("Unknown error occurred while creating product.");
      }
    }
  },

  // findAll: async () => {
  //   try {
  //     const products = await ProductModel.find();
  //     return products;
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       throw new Error("Error fetching products: " + error.message);
  //     } else {
  //       throw new Error("Unknown error occurred while fetching products.");
  //     }
  //   }
  // },

  findAll: async (page: number, limit: number) => {
    try {
        const skip = (page - 1) * limit;
        const products = await ProductModel.find().skip(skip).limit(limit);
        const totalProducts = await ProductModel.countDocuments(); // Total count of products

        return { products, totalProducts };
    } catch (error) {
        if (error instanceof Error) {
            throw new Error("Error fetching products: " + error.message);
        } else {
            throw new Error("Unknown error occurred while fetching products.");
        }
    }
},


  findById: async (id: string) => {
    try {
      // Check if the id is a valid ObjectId
      if (!Types.ObjectId.isValid(id)) {
        throw new Error("Invalid product ID.");
      }

      // Query the database for the product
      const product = await ProductModel.findById(id);

      // If no product is found
      if (!product) {
        throw new Error("Product not found.");
      }

      return product;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error("Error fetching product: " + error.message);
      }
      throw new Error("An unknown error occurred while fetching the product.");
    }
  },

  search: async (keyword: string) => {
    try {
      const products = await ProductModel.find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { category: { $regex: keyword, $options: "i" } },
        ],
      });

      return products;
    } catch (error: unknown) {
      // Type `error` as `Error` to access `message` and other properties
      if (error instanceof Error) {
        throw new Error("Error fetching products: " + error.message);
      }
      // Handle other types of error (if needed)
      throw new Error("An unknown error occurred while fetching products.");
    }
  },
  
  update: async (id: string, updateData: any) => {
    try {
      const updatedProduct = await ProductModel.findByIdAndUpdate(id, updateData, { new: true });
      return updatedProduct;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error("Error updating product: " + error.message);
      } else {
        throw new Error("Unknown error occurred while updating product.");
      }
    }
  },

  delete: async (id: string) => {
    try {
      await ProductModel.findByIdAndDelete(id);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error("Error deleting product: " + error.message);
      } else {
        throw new Error("Unknown error occurred while deleting product.");
      }
    }
  },
  getProductsByCategory: async (category: string) => {
    try {
      const products = await ProductModel.find({ category }); // Fetch products by category
      return products;
    } catch (error) {
      console.error("Error fetching products by category:", error);
      throw new Error("Error fetching products by category");
    }
  },
};
