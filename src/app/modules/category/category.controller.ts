import { NextFunction, Request, Response } from "express";
import { CategoryService } from "./category.service";
import CategoryModel from "../../models/Category";
import { uploadCategory, uploadDebug } from "../multer/multer.conf";



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
