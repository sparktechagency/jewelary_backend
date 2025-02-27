import mongoose, { Types } from "mongoose";
import ProductModel from "../../models/Product";  // Use default import
import ColorModel from "../../models/attribute/attribute.color";
import SizeModel from "../../models/attribute/attribute.size";
// import ThicknessModel from "../../models/attribute/attribute.thikness";


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
//       imageUrls,
//     });

//     await newProduct.save();
//     return newProduct;
//   } catch (error) {
//     throw new Error(error instanceof Error ? error.message : "An unknown error occurred.");
//   }
// },


// create: async (productData: any) => {
//   try {
//     const {
//       name,
//       details,
//       category,
//       minimumOrderQuantity,
//       availableQuantity,
//       thickness,
//       size,
//       color,
//       price,
//       quantity,
//       imageUrls,
//     } = productData;

//     if (availableQuantity < minimumOrderQuantity) {
//       throw new Error(`Minimum order quantity is ${minimumOrderQuantity}. Please increase the available quantity.`);
//     }

//     // Ensure color, size, and thickness are arrays
//     const colorArray = Array.isArray(color) ? color : [color];
//     const sizeArray = Array.isArray(size) ? size : [size];
//     const thicknessArray = Array.isArray(thickness) ? thickness : [thickness];

//     // **Validate and cast the provided color, size, and thickness IDs into ObjectIds**
//     const validateObjectIds = (ids: string[], type: string) => {
//       return ids.map((id) => {
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//           throw new Error(`Invalid ${type}Id: ${id}`);
//         }
//         return new mongoose.Types.ObjectId(id);
//       });
//     };

//     const colorObjectIds = validateObjectIds(colorArray, "color");
//     const sizeObjectIds = validateObjectIds(sizeArray, "size");
//     const thicknessObjectIds = validateObjectIds(thicknessArray, "thickness");

//     // ✅ Debugging: Log IDs before fetching data
//     console.log("Valid Color IDs:", colorObjectIds);
//     console.log("Valid Size IDs:", sizeObjectIds);
//     console.log("Valid Thickness IDs:", thicknessObjectIds);

//     // **Fetch data from the database**
//     const colorData = await ColorModel.find({ _id: { $in: colorObjectIds } });
//     const sizeData = await SizeModel.find({ _id: { $in: sizeObjectIds } });
//     const thicknessData = await ThicknessModel.find({ _id: { $in: thicknessObjectIds } });

//     // ✅ Debugging: Log the fetched data
//     console.log("Fetched Colors:", colorData);
//     console.log("Fetched Sizes:", sizeData);
//     console.log("Fetched Thickness:", thicknessData);

//     // **Check if any attribute is missing**
//     if (colorData.length !== colorObjectIds.length) {
//       throw new Error(`Some Color IDs do not exist in the database.`);
//     }
//     if (sizeData.length !== sizeObjectIds.length) {
//       throw new Error(`Some Size IDs do not exist in the database.`);
//     }
//     if (thicknessData.length !== thicknessObjectIds.length) {
//       throw new Error(`Some Thickness IDs do not exist in the database.`);
//     }

//     // **Create variations**
//     const variations = [];
//     for (const colorItem of colorData) {
//       for (const sizeItem of sizeData) {
//         for (const thicknessItem of thicknessData) {
//           variations.push({
//             color: colorItem.colorName || "N/A",
//             size: sizeItem.size || "N/A",
//             thickness: thicknessItem.thickness || "N/A",
//             price,
//             quantity,
//           });
//         }
//       }
//     }

//     // **Create and save the product**
//     const newProduct = new ProductModel({
//       name,
//       details,
//       category,
//       minimumOrderQuantity,
//       availableQuantity,
//       thickness,
//       size,
//       color,
//       price,
//       quantity,
//       variations,
//       imageUrls,
//     });

//     await newProduct.save();
//     return newProduct;
//   } catch (error) {
//     console.error("Product creation error:", error);
//     throw new Error(error instanceof Error ? error.message : "An unknown error occurred.");
//   }
// },


// create: async (productData: any) => {
//   try {
//     const {
//       name,
//       details,
//       category,
//       minimumOrderQuantity,
//       availableQuantity,
//       deliveryCharge,
//       price,
//       color,    // expected as array of IDs
//       size,     // expected as array of IDs
//       thickness // expected as array of IDs
//     } = productData;
    
//     // Validate availableQuantity vs minimumOrderQuantity
//     if (availableQuantity < minimumOrderQuantity) {
//       throw new Error(
//         `Available quantity (${availableQuantity}) must be greater than or equal to minimum order quantity (${minimumOrderQuantity}).`
//       );
//     }
    
//     // Ensure these fields are arrays (if not, wrap them)
//     const colorIds = Array.isArray(color) ? color : [color];
//     const sizeIds = Array.isArray(size) ? size : [size];
//     const thicknessIds = Array.isArray(thickness) ? thickness : [thickness];
    
//     // Validate ObjectIds
//     const validateObjectIds = (ids: string[], type: string) => {
//       return ids.map((id) => {
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//           throw new Error(`Invalid ${type} ID: ${id}`);
//         }
//         return new mongoose.Types.ObjectId(id);
//       });
//     };
    
//     const colorObjectIds = validateObjectIds(colorIds, "color");
//     const sizeObjectIds = validateObjectIds(sizeIds, "size");
//     const thicknessObjectIds = validateObjectIds(thicknessIds, "thickness");
    
//     // Fetch and validate attribute data from their models
//     const [colorData, sizeData, thicknessData] = await Promise.all([
//       ColorModel.find({ _id: { $in: colorObjectIds }, active: true }),
//       SizeModel.find({ _id: { $in: sizeObjectIds }, active: true }),
//       ThicknessModel.find({ _id: { $in: thicknessObjectIds }, active: true })
//     ]);
    
//     if (colorData.length !== colorObjectIds.length) {
//       throw new Error("Some colors do not exist or are inactive.");
//     }
//     if (sizeData.length !== sizeObjectIds.length) {
//       throw new Error("Some sizes do not exist or are inactive.");
//     }
//     if (thicknessData.length !== thicknessObjectIds.length) {
//       throw new Error("Some thicknesses do not exist or are inactive.");
//     }
    
//     // Create the new product without generating variations
//     const newProduct = new ProductModel({
//       name,
//       details,
//       category,
//       availableQuantity,
//       minimumOrderQuantity,
//       deliveryCharge,
//       price,
//       colors: colorObjectIds,
//       sizes: sizeObjectIds,
//       thicknesses: thicknessObjectIds,
//       file: productData.fileUrls || []
//     });
    
//     await newProduct.save();
//     return newProduct;
//   } catch (error) {
//     console.error("Product creation error:", error);
//     throw error;
//   }
// },

// create: async (productData: any) => {
//   try {
//     const {
//       name,
//       details,
//       category,
//       minimumOrderQuantity,
//       availableQuantity,
//       deliveryCharge,
//       price,
//       color,    // expected as array of IDs
//       size,     // expected as array of IDs
//       thickness, // expected as array of IDs
//       fileUrls,
//     } = productData;

//     if (availableQuantity < minimumOrderQuantity) {
//       throw new Error(
//         `Available quantity (${availableQuantity}) must be greater than or equal to minimum order quantity (${minimumOrderQuantity}).`
//       );
//     }

//     // Ensure these fields are arrays (if not, wrap them)
//     const colorIds = Array.isArray(color) ? color : [color];
//     const sizeIds = Array.isArray(size) ? size : [size];
//     const thicknessIds = Array.isArray(thickness) ? thickness : [thickness];

//     const validateObjectIds = (ids: string[], type: string) => {
//       return ids.map((id) => {
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//           throw new Error(`Invalid ${type} ID: ${id}`);
//         }
//         return new mongoose.Types.ObjectId(id);
//       });
//     };

//     const colorObjectIds = validateObjectIds(colorIds, "color");
//     const sizeObjectIds = validateObjectIds(sizeIds, "size");
//     const thicknessObjectIds = validateObjectIds(thicknessIds, "thickness");

//     // Fetch and validate attribute data from their models (only active ones)
//     const [colorData, sizeData, thicknessData] = await Promise.all([
//       ColorModel.find({ _id: { $in: colorObjectIds }, active: true }),
//       SizeModel.find({ _id: { $in: sizeObjectIds }, active: true }),
//       ThicknessModel.find({ _id: { $in: thicknessObjectIds }, active: true })
//     ]);

//     if (colorData.length !== colorObjectIds.length) {
//       throw new Error("Some selected colors are inactive. Please choose accessible colors.");
//     }
//     if (sizeData.length !== sizeObjectIds.length) {
//       throw new Error("Some selected sizes are inactive. Please choose accessible sizes.");
//     }
//     if (thicknessData.length !== thicknessObjectIds.length) {
//       throw new Error("Some selected thicknesses are inactive. Please choose accessible thicknesses.");
//     }

//     // Create the new product
//     const newProduct = new ProductModel({
//       name,
//       details,
//       category,
//       availableQuantity,
//       minimumOrderQuantity,
//       deliveryCharge,
//       price,
//       colors: colorObjectIds,
//       sizes: sizeObjectIds,
//       thicknesses: thicknessObjectIds,
//       file: fileUrls || []
//     });

//     await newProduct.save();
//     return newProduct;
//   } catch (error) {
//     console.error("Product creation error:", error);
//     throw error;
//   }
// },


create: async (productData: any) => {
  try {
    const {
      name,
      details,
      category,
      minimumOrderQuantity,
      availableQuantity,
      deliveryCharge,
      variations, // variations as an array of objects
      fileUrls,
    } = productData;

    // Check for required fields
    if (!name || !details || !category) {
      throw new Error("Name, details, and category are required.");
    }
    
    if (Number(availableQuantity) < Number(minimumOrderQuantity)) {
      throw new Error(
        `Available quantity (${availableQuantity}) must be greater than or equal to minimum order quantity (${minimumOrderQuantity}).`
      );
    }

    if (!Array.isArray(variations) || variations.length === 0) {
      throw new Error("At least one variation is required.");
    }

    // Helper to validate and convert an id string to ObjectId
    const validateAndConvert = (id: string, type: string): mongoose.Types.ObjectId => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid ${type} ID: ${id}`);
      }
      return new mongoose.Types.ObjectId(id);
    };

    // Validate each variation and convert fields to ObjectIds
    variations.forEach((v: any) => {
      v.color = validateAndConvert(v.color, "color");
      v.size = validateAndConvert(v.size, "size");
      // v.thickness = validateAndConvert(v.thickness, "thickness");

      // Validate variation price and quantity
      const priceVal = parseFloat(v.price);
      if (isNaN(priceVal)) {
        throw new Error("Invalid variation price.");
      }
      v.price = priceVal;

      v.quantity = Number(v.quantity);
      if (isNaN(v.quantity)) {
        throw new Error("Invalid variation quantity.");
      }
    });

    // Compute product price from variations (using the lowest variation price)
    const computedPrice = Math.min(...variations.map((v: any) => v.price));

    // Validate and convert category
    const categoryObjId = validateAndConvert(category, "category");

    // Extract unique color, size, and thickness IDs from variations
    const uniqueIds = (ids: mongoose.Types.ObjectId[]) =>
      Array.from(new Set(ids.map(id => id.toString()))).map(id => new mongoose.Types.ObjectId(id));

    const uniqueColorIds = uniqueIds(variations.map((v: any) => v.color));
    const uniqueSizeIds = uniqueIds(variations.map((v: any) => v.size));
    // const uniqueThicknessIds = uniqueIds(variations.map((v: any) => v.thickness));
    
    // Debug logging
    console.log("Unique Color IDs:", uniqueColorIds);

    // Fetch and validate attribute data from their models (only active ones)
    const [colorData, sizeData] = await Promise.all([
      ColorModel.find({ _id: { $in: uniqueColorIds }, active: true }),
      SizeModel.find({ _id: { $in: uniqueSizeIds }, active: true }),
      // ThicknessModel.find({ _id: { $in: uniqueThicknessIds }, active: true }),
    ]);

    console.log("Active Colors Found:", colorData);

    if (colorData.length !== uniqueColorIds.length) {
      throw new Error("Some selected colors are inactive. Please choose accessible colors.");
    }
    if (sizeData.length !== uniqueSizeIds.length) {
      throw new Error("Some selected sizes are inactive. Please choose accessible sizes.");
    }
    // if (thicknessData.length !== uniqueThicknessIds.length) {
    //   throw new Error("Some selected thicknesses are inactive. Please choose accessible thicknesses.");
    // }

    // Create and save the product document
    const newProduct = new ProductModel({
      name,
      details,
      category: categoryObjId,
      availableQuantity,
      minimumOrderQuantity,
      deliveryCharge,
      price: computedPrice,
      variations, // Save the variations array with full details
      file: fileUrls || []
    });

    await newProduct.save();
    return newProduct;
  } catch (error) {
    console.error("Product creation error:", error);
    throw error;
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
        if (
          !filteredProducts.some(prod => 
            (prod._id as mongoose.Types.ObjectId).equals(product._id as mongoose.Types.ObjectId)
          )
        ) {
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
