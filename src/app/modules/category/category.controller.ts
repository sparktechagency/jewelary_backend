import { Request, Response } from "express";
import { CategoryService } from "./category.service";
import CategoryModel from "../../models/Category";
import { upload } from "../multer/multer.conf";

export const CategoryController = {
    
        create: async (req: Request, res: Response): Promise<void> => {
          upload(req, res, async (err: any) => {
            if (err) {
              console.error("Multer Error:", err);
              return res.status(400).json({ message: err.message });
            }
      
            // 🔥 Debugging Logs
            console.log("Request Body:", req.body);
            console.log("Uploaded Files:", req.files);
      
            try {
              const { name } = req.body;
      
              // ✅ Extract uploaded image file path
              const image =
              req.files && "image" in req.files
                ? (req.files as { [fieldname: string]: Express.Multer.File[] })["image"][0].path
                : null;
            
      
              if (!name || !image) {
                return res.status(400).json({ message: "Name and Image are required for category creation." });
              }
      
              const newCategory = new CategoryModel({ name, image });
              await newCategory.save();
      
              res.status(201).json({
                message: "Category created successfully.",
                category: newCategory,
              });
            } catch (error) {
              console.error("Category creation error:", error);
              res.status(500).json({ message: (error as Error).message });
            }
          });
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

  update: async (req: Request, res: Response) => {
    try {
      const updatedCategory = await CategoryService.update(req.params.id, req.body);
      res.status(200).json(updatedCategory);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      await CategoryService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  },
};
