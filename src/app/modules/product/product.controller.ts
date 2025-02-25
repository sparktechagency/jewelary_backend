import { NextFunction, Request, Response } from "express";
import { ProductService } from "./product.service";
import { uploadProduct } from "../multer/multer.conf";
import ProductModel from "../../models/Product";
import path from "path";
import OrderModel from "../../models/order.model";
import mongoose from "mongoose";
export const ProductController = {


//   create: async (req: Request, res: Response): Promise<void> => {
//     try {
//       const { name, details, category } = req.body;
//       if (!name || !details || !category) {
//         res.status(400).json({ message: "Name, details, and category are required." });
//         return;
//       }
  
//       const parseNumberField = (fieldName: string, value: any): number => {
//         if (value === undefined || value === null || value === '') {
//           throw new Error(`${fieldName} is required and must be a number.`);
//         }
//         const num = parseFloat(value);
//         if (isNaN(num)) {
//           throw new Error(`${fieldName} must be a valid number.`);
//         }
//         return num;
//       };
  
//       const availableQuantity = parseNumberField("availableQuantity", req.body.availableQuantity);
//       const minimumOrderQuantity = parseNumberField("minimumOrderQuantity", req.body.minimumOrderQuantity);
//       const deliveryCharge = parseNumberField("deliveryCharge", req.body.deliveryCharge);
//       const price = parseNumberField("price", req.body.price);
  
//       const parseArrayField = (field: any): any[] => {
//         if (Array.isArray(field)) {
//           return field;
//         } else if (typeof field === "string" && field.trim().length) {
//           try {
//             return JSON.parse(field);
//           } catch (err) {
//             throw new Error("Invalid JSON format in one of the array fields.");
//           }
//         }
//         return [];
//       };
  
//       const color = parseArrayField(req.body.color);
//       const size = parseArrayField(req.body.size);
//       const thickness = parseArrayField(req.body.thickness);
  
//       // Check for file uploads via Multer:
//       // let fileUrls = [];
//       // if (req.files && (req.files as any)["images"]) {
//       //   fileUrls = (req.files as any)["images"].map((file: Express.Multer.File) => file.path);
//       // } else {
//       //   // Fallback to reading from req.body.file if provided as JSON:
//       //   fileUrls = parseArrayField(req.body.file);
//       // }
//       let fileUrls = [];
// if (req.files && (req.files as any)["images"]) {
//   // Define your project root (adjust if needed)
//   const projectRoot = path.resolve(__dirname, '../../../'); 
//   fileUrls = (req.files as any)["images"].map((file: Express.Multer.File) => {
//     // Calculate the relative path from the project root
//     let relPath = path.relative(projectRoot, file.path);
//     // Ensure the path starts with a backslash if desired
//     if (!relPath.startsWith(path.sep)) {
//       relPath = path.sep + relPath;
//     }
//     return relPath;
//   });
// } else {
//   // Fallback: if no files are uploaded, try to parse from req.body (if provided)
//   fileUrls = parseArrayField(req.body.file);
// }
  
//       const productData = {
//         name,
//         details,
//         category,
//         availableQuantity,
//         minimumOrderQuantity,
//         deliveryCharge,
//         price,
//         color,
//         size,
//         thickness,
//         fileUrls, // This will be used in the service to set the "file" field
//       };
  
//       const product = await ProductService.create(productData);
//       res.status(201).json(product);
//     } catch (error: any) {
//       console.error("Product creation error:", error);
//       res.status(500).json({ message: error.message });
//     }
//   },
  


  // findAll: async (req: Request, res: Response): Promise<void> => {
  //   try {
  //     const page = parseInt(req.query.page as string) || 1;
  //     const limit = 10;
  //     const skip = (page - 1) * limit;

  //     // Populate colors, sizes, thicknesses, and category details.
  //     const productsPromise = ProductModel.find({})
  //       .populate("colors")      // Retrieves full color details from Color collection
  //       .populate("sizes")       // Retrieves full size details from Size collection
  //       .populate("thicknesses") // Retrieves full thickness details from Thickness collection
  //       .populate("category")    // Retrieves category details from Category collection
  //       .skip(skip)
  //       .limit(limit)
  //       .exec();

  //     const countPromise = ProductModel.countDocuments();

  //     const [products, totalProducts] = await Promise.all([productsPromise, countPromise]);

  //     res.status(200).json({
  //       page,
  //       totalPages: Math.ceil(totalProducts / limit),
  //       totalProducts,
  //       products,
  //     });
  //   } catch (error) {
  //     res.status(500).json({ message: (error as Error).message });
  //   }
  // },

  // Optionally, update findById to populate as well:
  

    create: async (req: Request, res: Response): Promise<void> => {
      try {
        // Basic required fields check
        if (!req.body.name || !req.body.details || !req.body.category) {
          res.status(400).json({ message: "Name, details, and category are required." });
          return;
        }
  
        // Parse variations (expecting a JSON string)
        let variations = [];
        try {
          variations = typeof req.body.variations === "string" ? JSON.parse(req.body.variations) : req.body.variations;
        } catch (e) {
           res.status(400).json({ message: "Invalid variations format." });
           return
        }
  
        // Build fileUrls from uploaded images if available
        let fileUrls: string[] = [];
        if (req.files && (req.files as any)["images"]) {
          const projectRoot = path.resolve(__dirname, '../../../');
          fileUrls = (req.files as any)["images"].map((file: Express.Multer.File) => {
            let relPath = path.relative(projectRoot, file.path);
            if (!relPath.startsWith(path.sep)) {
              relPath = path.sep + relPath;
            }
            return relPath;
          });
        } else if (req.body.file) {
          try {
            fileUrls = typeof req.body.file === "string" ? JSON.parse(req.body.file) : req.body.file;
          } catch (e) {
            fileUrls = [];
          }
        }
  
        // Build productData from the request body
        const productData = {
          name: req.body.name,
          details: req.body.details,
          category: req.body.category,
          availableQuantity: req.body.availableQuantity,
          minimumOrderQuantity: req.body.minimumOrderQuantity,
          deliveryCharge: req.body.deliveryCharge,
          variations,
          fileUrls,
        };
  
        // Create product via service
        const product = await ProductService.create(productData);
  
        // Retrieve the created product with populated category and variations references
        const populatedProduct = await ProductModel.findById(product._id)
          .populate("category")
          .populate("variations.color")
          .populate("variations.size")
          .populate("variations.thickness")
          .exec();
  
        res.status(201).json(populatedProduct);
      } catch (error: any) {
        console.error("Product creation error:", error);
        res.status(500).json({ message: error.message });
      }
    },

  // findAll: async (req: Request, res: Response): Promise<void> => {
  //   try {
  //     const page = parseInt(req.query.page as string) || 1;
  //     const limit = 10;
  //     const skip = (page - 1) * limit;

  //     const productsPromise = ProductModel.find({})
  //       .populate({ path: "colors", match: { active: true } })
  //       .populate({ path: "sizes", match: { active: true } })
  //       .populate({ path: "thicknesses", match: { active: true } })
  //       .populate("category")
  //       .skip(skip)
  //       .limit(limit)
  //       .exec();

  //     const countPromise = ProductModel.countDocuments();
  //     const [products, totalProducts] = await Promise.all([productsPromise, countPromise]);

  //     res.status(200).json({
  //       page,
  //       totalPages: Math.ceil(totalProducts / limit),
  //       totalProducts,
  //       products,
  //     });
  //   } catch (error) {
  //     res.status(500).json({ message: (error as Error).message });
  //   }
  // },

  // findById: async (req: Request, res: Response): Promise<void> => {
  //   try {
  //     const productId = req.params.id;
  //     const product = await ProductModel.findById(productId)
  //       .populate("colors")
  //       .populate("sizes")
  //       .populate("thicknesses")
  //       .populate("category")
  //       .exec();

  //     if (!product) {
  //       res.status(404).json({ message: "Product not found" });
  //       return;
  //     }

  //     res.status(200).json(product);
  //   } catch (error) {
  //     res.status(500).json({ message: (error as Error).message });
  //   }
  // },
  // update: async (req: Request, res: Response): Promise<void> => {
  //   try {
  //     const updatedProduct = await ProductService.update(req.params.id, req.body);
  //     res.status(200).json(updatedProduct);
  //   } catch (error) {
  //     res.status(500).json({ message: (error as Error).message });
  //   }
  // },

 
  findAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = 10;
      const skip = (page - 1) * limit;

      // Find products and populate nested variation fields
      const productsPromise = ProductModel.find({})
        .populate("category")
        .populate({ path: "variations.color", match: { active: true } })
        .populate({ path: "variations.size", match: { active: true } })
        .populate({ path: "variations.thickness", match: { active: true } })
        .skip(skip)
        .limit(limit)
        .exec();

      const countPromise = ProductModel.countDocuments();

      const [products, totalProducts] = await Promise.all([productsPromise, countPromise]);

      res.status(200).json({
        page,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts,
        products,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  findById: async (req: Request, res: Response): Promise<void> => {
    try {
      const productId = req.params.id;
      const product = await ProductModel.findById(productId)
        .populate("category")
        .populate({ path: "variations.color", match: { active: true } })
        .populate({ path: "variations.size", match: { active: true } })
        .populate({ path: "variations.thickness", match: { active: true } })
        .exec();

      if (!product) {
        res.status(404).json({ message: "Product not found" });
        return;
      }

      res.status(200).json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const updatedProduct = await ProductService.update(req.params.id, req.body);
      res.status(200).json(updatedProduct);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },


  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      await ProductService.delete(req.params.id);
      res.status(204).send(); // No content on successful deletion
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  },

  search: async (req: Request, res: Response): Promise<void> => {
    try {
      const keyword = req.query.keyword as string;

      if (!keyword) {
        res.status(400).json({ message: "Please provide a search keyword." });
        return;
      }

      const products = await ProductService.search(keyword);

      if (products.length === 0) {
        res.status(200).json({ message: "Empty Products", products: [] });
        return;
      }
      

      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  },

 
    getBestSellingProducts: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        // Aggregate order items to calculate the total number of units sold per product
        const bestSellingAggregation = await OrderModel.aggregate([
          { $unwind: "$items" },  // Unwind the items array to get individual items from orders
          {
            $group: {
              _id: "$items.productId",  // Group by productId
              totalSold: { $sum: "$items.quantity" }  // Sum the quantity sold for each product
            }
          },
          { $sort: { totalSold: -1 } },  // Sort by totalSold in descending order
          { $limit: 3 }  // Limit to the top 3 best-selling products based on purchases
        ]);
  
        // Extract product IDs from the aggregation result
        const productIds = bestSellingAggregation.map(item => item._id);
  
        // Fetch product details for these product IDs
        const products = await ProductModel.find({ _id: { $in: productIds } })
          .populate("category")  // Populate category info
          .populate("variations.color")  // Populate color info
          .populate("variations.size")   // Populate size info
          .populate("variations.thickness")  // Populate thickness info
          .exec();
  
        // Merge the aggregated data with product details and calculate total earnings (total quantity * price)
        const bestSellingProducts = bestSellingAggregation.map(item => {
          const product = products.find(p =>
            (p._id as mongoose.Types.ObjectId).equals(item._id)
          );
  
          // Calculate total earnings for the product
          let totalEarnings = 0;
          let stockStatus = "Out of Stock"; // Default to "Out of Stock"
          if (product) {
            product.variations.forEach((variation: any) => {
              totalEarnings += variation.price * item.totalSold;  // Multiply quantity sold by price of the variation
              // Check the available quantity to determine stock status
              if (variation.quantity > 0) {
                stockStatus = "In Stock";  // Set as "In Stock" if the quantity is greater than 0
              }
            });
          }
  
          return {
            product,
            totalSold: item.totalSold,  // The total number of times the product was sold
            totalEarnings,  // The total earnings for this product
            stockStatus  // Stock status ("In Stock" or "Out of Stock")
          };
        });
  
        // Sort by total earnings (if needed) or by the number of products sold (already sorted)
        const highestSellingProduct = bestSellingProducts.length > 0 ? bestSellingProducts[0] : null;
  
        // Return the response with only necessary data: product name, total sold, earnings, and stock status
        res.status(200).json({
          highestSellingProduct,
          bestSellingProducts
        });
      } catch (error) {
        next(error);
      }
    },
  
  

  
  
  
  
};
