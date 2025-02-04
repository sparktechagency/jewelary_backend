import { Request, Response } from "express";
import { ProductService } from "./product.service";

export const ProductController = {
  create: async (req: Request, res: Response): Promise<void> => {
    try {
      const productData = req.body; // Get the product data from the request body
      const product = await ProductService.create(productData); // Call the service to create the product
      res.status(201).json(product); // Send back the created product
    } catch (error) {
      res.status(500).json({ message: (error as Error).message }); // Send an error response if creation fails
    }
  },

  findAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1; // Default to page 1
      const limit = 10; // Number of products per page

      const { products, totalProducts } = await ProductService.findAll(page, limit);

      res.status(200).json({
        page,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts,
        products,
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message }); // Handle any errors
    }
  },

  findById: async (req: Request, res: Response): Promise<void> => {
    try {
      const productId = req.params.id;
      const product = await ProductService.findById(productId);

      if (!product) {
        res.status(404).json({ message: "Product not found" });
        return;
      }

      res.status(200).json(product); // Return the product if found
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  },

  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const updatedProduct = await ProductService.update(req.params.id, req.body);
      res.status(200).json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
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

  getProductsByCategory: async (req: Request, res: Response): Promise<void> => {
    try {
      const { category } = req.query;

      if (!category) {
        res.status(400).json({ message: "Category is required" });
        return;
      }

      const validCategories = [
        "Jewelry Box",
        "Leather Box",
        "Cardboard Box",
        "Paper Box",
        "Paper Bag",
      ];

      if (!validCategories.includes(category as string)) {
        res.status(400).json({ message: "Invalid category" });
        return;
      }

      const products = await ProductService.getProductsByCategory(category as string);
      res.status(200).json({ success: true, products });
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
        res.status(404).json({ message: "No products found." });
        return;
      }

      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  },
};
