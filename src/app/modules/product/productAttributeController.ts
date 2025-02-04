import { Request, Response } from "express";
import ProductAttributeModel from "../../models/ProductAttribute";

export const ProductAttributeController = {
  // API to create product attributes
  create: async (req: Request, res: Response): Promise<void> => {
    try {
      const { color, size, thickness, quantity } = req.body;
      
      // Create a new ProductAttribute with multiple options
      const productAttribute = new ProductAttributeModel({
        color,
        size,
        thickness,
        quantity,
      });

      // Save the new product attribute to the database
      await productAttribute.save();

      res.status(201).json(productAttribute); // Return the created product attribute
    } catch (error) {
      res.status(500).json({ message: (error as Error).message }); // Handle errors
    }
  },
  // update the product attribute
    update: async (req: Request, res: Response): Promise<void> => {
        try {
        const { color, size, thickness, quantity } = req.body;
        const { id } = req.params;
    
        // Find the product attribute by ID and update it
        const updatedProductAttribute = await ProductAttributeModel.findByIdAndUpdate(
            id,
            { color, size, thickness, quantity },
            { new: true }
        );
    
        res.status(200).json(updatedProductAttribute); // Return the updated product attribute
        } catch (error) {
        res.status(500).json({ message: (error as Error).message }); // Handle errors
        }
    },
    // delete the product attribute
    delete: async (req: Request, res: Response): Promise<void> => {
        try {
        const { id } = req.params;
    
        // Find the product attribute by ID and delete it
        await ProductAttributeModel.findByIdAndDelete(id);
    
        res.status(204).end; // Return 204 No Content
        } catch (error) {
        res.status(500).json({ message: (error as Error).message }); // Handle errors
        }
    },

  // API to fetch all product attributes
  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const attributes = await ProductAttributeModel.find(); // Fetch all product attributes
      res.status(200).json(attributes); // Return all product attributes
    } catch (error) {
      res.status(500).json({ message: (error as Error).message }); // Handle errors
    }
  },
};
