import { Request, Response } from "express";
import { ProductService } from "./product.service";
import { uploadProduct } from "../multer/multer.conf";
import ProductModel from "../../models/Product";

export const ProductController = {

  // create: async (req: Request, res: Response): Promise<void> => {
  //   try {
  //     const productData = req.body;

  //     if (!productData.attributeOptions) {
  //       res.status(400).json({ message: "attributeOptions is required." });
  //       return;
  //     }

  //     if (productData.minimumOrderQuantity && productData.availableQuantity < productData.minimumOrderQuantity) {
  //       res.status(400).json({
  //         message: `Minimum order quantity is ${productData.minimumOrderQuantity}. Please increase the order quantity.`,
  //       });
  //       return;
  //     }

  //     const product = await ProductService.create(productData);
  //     res.status(201).json(product);
  //   } catch (error) {
  //     res.status(500).json({ message: (error as Error).message });
  //   }
  // },
  

  // findAll: async (req: Request, res: Response): Promise<void> => {
  //   try {
  //     const page = parseInt(req.query.page as string) || 1; // Default to page 1
  //     const limit = 10; // Number of products per page

  //     const { products, totalProducts } = await ProductService.findAll(page, limit);

  //     res.status(200).json({
  //       page,
  //       totalPages: Math.ceil(totalProducts / limit),
  //       totalProducts,
  //       products,
  //     });
  //   } catch (error) {
  //     res.status(500).json({ message: (error as Error).message }); // Handle any errors
  //   }
  // },

  // create: async (req: Request, res: Response): Promise<void> => {
  //   uploadProduct(req, res, async (err: any) => {
  //     if (err) {
  //       return res.status(400).json({ message: `Multer error: ${err.message}` });
  //     }

  //     const productData = req.body;

  //     productData.availableQuantity = Number(productData.availableQuantity);
  //     productData.minimumOrderQuantity = Number(productData.minimumOrderQuantity);
  //     productData.deliveryCharge = Number(productData.deliveryCharge);

  //     if (!productData.attributeOptions) {
  //       return res.status(400).json({ message: "attributeOptions is required." });
  //     }

  //     if (productData.availableQuantity < productData.minimumOrderQuantity) {
  //       return res.status(400).json({
  //         message: `Minimum order quantity is ${productData.minimumOrderQuantity}. Please increase the available quantity.`,
  //       });
  //     }

  //     let imageUrls: string[] = [];
  //     if (req.files && (req.files as any)["images"]) {
  //       imageUrls = (req.files as any)["images"].map((file: Express.Multer.File) => `/uploads/products/${file.filename}`);
  //     }

  //     productData.imageUrls = imageUrls;

  //     const product = await ProductService.create(productData);
  //     res.status(201).json(product);
  //   });
  // },
  
  
  

  // findAll: async (req: Request, res: Response): Promise<void> => {
  //   try {
  //     const page = parseInt(req.query.page as string) || 1;
  //     const limit = 10;

  //     const { products, totalProducts } = await ProductService.findAll(page, limit);

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
  //     const product = await ProductService.findById(productId);

  //     if (!product) {
  //       res.status(404).json({ message: "Product not found" });
  //       return;
  //     }

  //     res.status(200).json(product); // Return the product if found
  //   } catch (error) {
  //     res.status(500).json({ message: (error as Error).message });
  //   }
  // },

  // createProduct: async (req: Request, res: Response): Promise<void> => {
  //   console.log("Received productData:", req.body);
  
  //   uploadProduct(req, res, async (err: any) => {
  //     if (err) {
  //       return res.status(400).json({ message: `Multer error: ${err.message}` });
  //     }
  
  //     const productData = req.body;
  
  //     // Convert stringified arrays to actual arrays
  //     try {
  //       productData.color = typeof productData.color === "string" ? JSON.parse(productData.color) : productData.color;
  //       productData.size = typeof productData.size === "string" ? JSON.parse(productData.size) : productData.size;
  //       productData.thickness = typeof productData.thickness === "string" ? JSON.parse(productData.thickness) : productData.thickness;
  //     } catch (e) {
  //       return res.status(400).json({ message: "Invalid array format for color, size, or thickness." });
  //     }
  
  //     // Convert numerical fields
  //     productData.availableQuantity = Number(productData.availableQuantity);
  //     productData.minimumOrderQuantity = Number(productData.minimumOrderQuantity);
  //     productData.deliveryCharge = Number(productData.deliveryCharge);
  
  //     console.log("Parsed productData:", productData);
  
  //     try {
  //       const product = await ProductService.create(productData);
  //       res.status(201).json(product);
  //     } catch (error) {
  //       console.error("Error in createProduct:", error);
  //       res.status(500).json({ message: (error as Error).message });
  //     }
  //   });
  // },
 
  

 create: async (req: Request, res: Response): Promise<void> => {
  try {
    const productData = {
      name: req.body.name,
      details: req.body.details,
      category: req.body.category,
      availableQuantity: parseInt(req.body.availableQuantity),
      minimumOrderQuantity: parseInt(req.body.minimumOrderQuantity),
      deliveryCharge: parseInt(req.body.deliveryCharge),
      price: parseInt(req.body.price),
      color: JSON.parse(req.body.color),
      size: JSON.parse(req.body.size),
      thickness: JSON.parse(req.body.thickness),
      imageUrls: req.body.imageUrls ? JSON.parse(req.body.imageUrls) : []
    };

    if (productData.availableQuantity < productData.minimumOrderQuantity) {
      res.status(400).json({
        message: `Available quantity (${productData.availableQuantity}) must be greater than minimum order quantity (${productData.minimumOrderQuantity}).`
      });
      return;
    }

    const product = await ProductService.create(productData);
    res.status(201).json(product);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "An unknown error occurred"
    });
  }
},

  findAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = 10;

      const { products, totalProducts } = await ProductService.findAll(page, limit);

      res.status(200).json({
        page,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts,
        products,
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
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

      res.status(200).json(product);
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
};
