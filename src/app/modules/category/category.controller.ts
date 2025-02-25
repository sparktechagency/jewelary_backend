import { NextFunction, Request, Response } from "express";
import { CategoryService } from "./category.service";
import CategoryModel from "../../models/Category";
import ColorModel from "../../models/attribute/attribute.color";
import SizeModel from "../../models/attribute/attribute.size";
import ThicknessModel from "../../models/attribute/attribute.thikness";

import { uploadCategory, uploadDebug } from "../multer/multer.conf";
import multer from "multer";
import mongoose from "mongoose";
import ProductModel from "../../models/Product";



export const CategoryController = {

    create: async (req: Request, res: Response): Promise<void> => {
      uploadCategory(req, res, async (err: any) => {
        if (err) {
          console.error("🚨 Multer Error:", err);
          return res.status(400).json({ message: err.message });
        }
  
        console.log("📂 Uploaded File:", req.file);
        console.log("📝 Request Body:", req.body);
  
        try {
          const { name } = req.body;
          if (!req.file) {
            return res.status(400).json({ message: "Image file is required." });
          }
  
          const image = `/uploads/categories/${req.file.filename}`;
  
          if (!name || !image) {
            return res.status(400).json({ message: "Name and Image are required for category creation." });
          }
  
          // 🔍 Check if category exists before proceeding
          const result = await CategoryService.create({ name, image });
  
          if (result.error) {
            return res.status(409).json(result); // ✅ Return conflict status
          }
  
          res.status(201).json(result);
        } catch (error) {
          console.error("🔥 Category creation error:", error);
          res.status(500).json({ message: (error as Error).message });
        }
      });
    },
  
    getCategories: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        // Optional query parameter, e.g. /api/categories?active=true
        const { active } = req.query;
        let filter = {};
        if (active !== undefined) {
          // Convert query value to boolean (if "true", then true; if "false", then false)
          filter = { active: active === "true" };
        }
        const ProductData = await ProductModel.find()
        const categories = await CategoryModel.find(filter);
        res.status(200).json(categories);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },

  findAll: async (_req: Request, res: Response) => {
    try {
      const categories = await CategoryService.findAll();
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  },


  findById: async (req: Request, res: Response) => {
    try {
      const category = await CategoryService.findById(req.params.id);
      if (!category) {
        res.status(404).json({ message: "Category not found" });
        return;
      }
      res.status(200).json(category);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  },

    update: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      // Use the multer middleware for handling file upload (expects field 'image' for category image)
      uploadCategory(req, res, async (err: any) => {
        try {
          // Handle multer errors
          if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: `Multer Error: ${err.message}` });
          }
          if (err) {
            return res.status(400).json({ message: err.message });
          }
  
          // Log incoming request for debugging purposes
          console.log("Update request body:", req.body);
          console.log("Category ID:", req.params.id);
  
          const { id } = req.params;
          const { active, name, image } = req.body;
  
          // Validate that at least one field to update is provided
          const updateData: { active?: boolean; name?: string; image?: string } = {};
  
          if (active !== undefined) updateData.active = active;
          if (name) updateData.name = name;
          if (image) updateData.image = image;
  
          // If no valid fields are provided, return a 400 error
          if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "No valid fields provided for update." });
          }
  
          // Call the CategoryService update method
          const updatedCategory = await CategoryService.update(id, updateData);
  
          // If no category was found with the provided ID, return a 404 error
          if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found with this ID." });
          }
  
          // Return the updated category
          res.status(200).json({
            message: "Category updated successfully",
            category: updatedCategory,
          });
        } catch (error: any) {
          console.error("Error updating category:", error);
          next(error);
        }
      });
    },
  
  

  delete: async (req: Request, res: Response) => {
    try {
      await CategoryService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  
  },

    // 🟢 Get all categories with the number of products in each category
    getCategoriesWithProductCount: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        // Fetch all categories
        const categories = await CategoryModel.find({});
  
        // Fetch the number of products in each category using aggregation
        const categoriesWithProductCount = await Promise.all(
          categories.map(async (category) => {
            // Count products in this category
            const productCount = await ProductModel.countDocuments({
              category: category._id,
              
            });
  
            // Return the category with the product count
            return {
              categoryId: category._id,
              categoryName: category.name,
              categoryImage: category.image,
              totalProducts: productCount,
             
            };
          })
        );
  
        res.status(200).json(categoriesWithProductCount);
      } catch (error) {
        next(error);
      }
    },


      // 🟢 Get category inventory with filters for search, color, size, and thickness
      getCategoryInventory: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
          const { categoryId } = req.params; // Get the category ID from the URL params
          const { search = "", color, size, thickness } = req.query; // Search query, and optional filters for color, size, and thickness
    
          // Validate categoryId (ensure it's a valid ObjectId)
          if (!mongoose.Types.ObjectId.isValid(categoryId)) {
             res.status(400).json({ message: "Invalid category ID" });  // Send response and return immediately
             return
            }
    
          // Find the category by categoryId
          const category = await CategoryModel.findById(categoryId);
          if (!category) {
             res.status(404).json({ message: "Category not found" });  // Send response and return immediately
             return
            }
    
          // Build the base query for finding products in the category
          const query: any = { category: new mongoose.Types.ObjectId(categoryId) };
    
          // Apply search filter (searching by product name)
          if (search) {
            query.name = { $regex: search, $options: "i" }; // Case-insensitive search
          }
    
          // Apply color filter if provided and valid ObjectId
          if (color && mongoose.Types.ObjectId.isValid(color as string)) {
            query["variations.color"] = new mongoose.Types.ObjectId(color as string);
          }
    
          // Apply size filter if provided and valid ObjectId
          if (size && mongoose.Types.ObjectId.isValid(size as string)) {
            query["variations.size"] = new mongoose.Types.ObjectId(size as string);
          }
    
          // Apply thickness filter if provided and valid ObjectId
          if (thickness && mongoose.Types.ObjectId.isValid(thickness as string)) {
            query["variations.thickness"] = new mongoose.Types.ObjectId(thickness as string);
          }
    
          // Perform the query on products to fetch the products for the category
          const products = await ProductModel.find(query)
            .populate("category")  // Populate category
            .populate("variations.color")  // Populate color data
            .populate("variations.size")   // Populate size data
            .populate("variations.thickness")  // Populate thickness data
            .exec();
    
          // If no products are found, return an empty array for products
          if (!products || products.length === 0) {
             res.status(404).json({
              category: category.name,
              totalProducts: 0,
              products: [],
            });
            return
          }
    
          // Compute total products in this category
          const totalProducts = products.length;
    
          // Map through products to get the details for each variation (color, size, thickness, quantity)
          const productsWithDetails = products.map((product: any) => {
            return {
              productId: product._id,
              name: product.name,
              details: product.details,
              price: product.price,
              fileUrls: product.file,
              variations: product.variations.map((v: any) => ({
                color: v.color,
                size: v.size,
                thickness: v.thickness,
                quantity: v.quantity,
                price: v.price,
              }))
            };
          });
    
          // Return the category inventory details
          res.status(200).json({
            category: category.name,
            totalProducts,
            products: productsWithDetails,
          });
    
        } catch (error) {
          next(error);  // Pass the error to the next error handler
        }
      },
    

  // 🟢 Get all categories with their products and product details
  getAllCategoryProducts: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Fetch all categories
      const categories = await CategoryModel.find({});

      // Aggregate to get all products linked to these categories
      const allCategoryProducts = await Promise.all(
        categories.map(async (category) => {
          // Fetch all products for the current category
          const products = await ProductModel.find({ category: category._id })
            .populate("category")  // Populate category details
            .populate("variations.color")  // Populate color details
            .populate("variations.size")   // Populate size details
            .populate("variations.thickness")  // Populate thickness details
            .exec();

          // Compute total products in this category
          const totalProducts = products.length;

          // Map through the products to get their details
          const productsWithDetails = products.map((product: any) => {
            return {
              productId: product._id,
              name: product.name,
              details: product.details,
              price: product.price,
              fileUrls: product.file,
              variations: product.variations.map((v: any) => ({
                color: v.color,
                size: v.size,
                thickness: v.thickness,
                quantity: v.quantity,
                price: v.price,
              }))
            };
          });

          // Return the category and its product details
          return {
            categoryName: category.name,
            totalProducts,
            products: productsWithDetails,
          };
        })
      );

      // Return the data for all categories with products
      res.status(200).json(allCategoryProducts);
    } catch (error) {
      next(error);  // Pass the error to the next error handler
    }
  },


    
    


};
