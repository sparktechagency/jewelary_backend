import { Types } from "mongoose";
import ProductModel from "../../models/Product";  // Use default import
import ProductAttributeModel from "../../models/ProductAttribute";

export const ProductService = {
  // create: async (productData: any) => {
  //   try {
  //     const { name, details, category, minimumOrderQuantity, availableQuantity, attributeOptions, deliveryCharge, imageUrls } = productData;
  
  //     if (availableQuantity < minimumOrderQuantity) {
  //       throw new Error(`Minimum order quantity is ${minimumOrderQuantity}. Please increase the available quantity.`);
  //     }
  
  //     const attributeData = await ProductAttributeModel.findById(attributeOptions);
  //     if (!attributeData) {
  //       throw new Error("Invalid attributeOptions ID. Product attributes not found.");
  //     }
  
  //     const variations = [];
  //     for (let i = 0; i < attributeData.color.length; i++) {
  //       variations.push({
  //         color: attributeData.color[i] || "N/A",
  //         size: attributeData.size[i] || "N/A",
  //         thickness: attributeData.thickness[i] || "N/A",
  //         quantity: attributeData.quantity[i] || 0,
  //         price: (Math.random() * 100).toFixed(2),
  //       });
  //     }
  
  //     const newProduct = new ProductModel({
  //       name,
  //       details,
  //       category,
  //       minimumOrderQuantity,
  //       deliveryCharge,
  //       availableQuantity,
  //       attributeOptions,
  //       variations,
  //       imageUrls, // ✅ Store multiple image URLs
  //     });
  
  //     await newProduct.save();
  //     return newProduct;
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       throw new Error(error.message);
  //     } else {
  //       throw new Error("An unknown error occurred.");
  //     }
  //   }
  // },
  

//   findAll: async (page: number, limit: number) => {
//     try {
//         const skip = (page - 1) * limit;
//         const products = await ProductModel.find().skip(skip).limit(limit);
//         const totalProducts = await ProductModel.countDocuments(); // Total count of products

//         return { products, totalProducts };
//     } catch (error) {
//         if (error instanceof Error) {
//             throw new Error("Error fetching products: " + error.message);
//         } else {
//             throw new Error("Unknown error occurred while fetching products.");
//         }
//     }
// },


//   findById: async (id: string) => {
//     try {
//       // Check if the id is a valid ObjectId
//       if (!Types.ObjectId.isValid(id)) {
//         throw new Error("Invalid product ID.");
//       }

//       // Query the database for the product
//       const product = await ProductModel.findById(id);

//       // If no product is found
//       if (!product) {
//         throw new Error("Product not found.");
//       }

//       return product;
//     } catch (error: unknown) {
//       if (error instanceof Error) {
//         throw new Error("Error fetching product: " + error.message);
//       }
//       throw new Error("An unknown error occurred while fetching the product.");
//     }
//   },


create: async (productData: any) => {
  try {
    const { name, details, category, minimumOrderQuantity, availableQuantity, attributeOptions, deliveryCharge, imageUrls } = productData;

    if (availableQuantity < minimumOrderQuantity) {
      throw new Error(`Minimum order quantity is ${minimumOrderQuantity}. Please increase the available quantity.`);
    }

    const attributeData = await ProductAttributeModel.findById(attributeOptions);
    if (!attributeData) {
      throw new Error("Invalid attributeOptions ID. Product attributes not found.");
    }

    const variations = [];
    for (let i = 0; i < attributeData.color.length; i++) {
      variations.push({
        color: attributeData.color[i] || "N/A",
        size: attributeData.size[i] || "N/A",
        thickness: attributeData.thickness[i] || "N/A",
        quantity: attributeData.quantity[i] || 0,
        price: (Math.random() * 100).toFixed(2),
      });
    }

    const newProduct = new ProductModel({
      name,
      details,
      category,
      minimumOrderQuantity,
      deliveryCharge,
      availableQuantity,
      attributeOptions,
      variations,
      imageUrls,
    });

    await newProduct.save();
    return newProduct;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "An unknown error occurred.");
  }
},

findAll: async (page: number, limit: number) => {
  try {
    const skip = (page - 1) * limit;
    const products = await ProductModel.find()
      .populate("category", "name") // ✅ Populate category details (Only name)
      .skip(skip)
      .limit(limit);

    const totalProducts = await ProductModel.countDocuments();
    return { products, totalProducts };
  } catch (error) {
    throw new Error(error instanceof Error ? "Error fetching products: " + error.message : "Unknown error occurred.");
  }
},

findById: async (id: string) => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid product ID.");
    }

    const product = await ProductModel.findById(id)
      .populate("category", "name image"); // ✅ Populate category with name & image

    if (!product) {
      throw new Error("Product not found.");
    }

    return product;
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? "Error fetching product: " + error.message : "Unknown error occurred.");
  }
},
 
  // search: async (keyword: string) => {
  //   try {
  //     const products = await ProductModel.find({
  //       $or: [
  //         { name: { $regex: new RegExp(keyword, "i") } }, // ✅ Works fine for strings
  //       ],
  //     })
  //     .populate({
  //       path: "category",
  //       match: { name: { $regex: new RegExp(keyword, "i") } }, // ✅ Filter category after population
  //       select: "name", // Only return category name
  //     });
  
  //     return products.filter(product => product.category !== null); // ✅ Remove products with no category match
  //   } catch (error: unknown) {
  //     if (error instanceof Error) {
  //       throw new Error("Error fetching products: " + error.message);
  //     }
  //     throw new Error("An unknown error occurred while fetching products.");
  //   }
  // },
  

  search: async (keyword: string) => {
    try {
      const regex = new RegExp(keyword, "i"); // ✅ Case-insensitive match
  
      // ✅ Find products where `name` or `details` match
      const products = await ProductModel.find({
        $or: [
          { name: { $regex: regex } }, 
          { details: { $regex: regex } }
        ]
      }).populate("category", "name"); // ✅ Populate category name
  
      // ✅ Find products where `category.name` matches the keyword
      const categoryProducts = await ProductModel.find()
        .populate({
          path: "category",
          match: { name: { $regex: regex } }, // ✅ Filter at the database level
          select: "name",
        })
        .then(results => results.filter(product => product.category)); // ✅ Ensure category exists
  
      // ✅ Merge products found by name and by category name (avoiding duplicates)
      const filteredProducts = [...products];
  
      categoryProducts.forEach(product => {
        if (!filteredProducts.some(prod => prod._id.equals(product._id))) {
          filteredProducts.push(product);
        }
      });
  
      // ✅ Return only products that were correctly matched
      return filteredProducts.length > 0 ? filteredProducts : [];
    } catch (error) {
      throw new Error(error instanceof Error ? "Error fetching products: " + error.message : "An unknown error occurred.");
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
