import { Router } from "express";
import { ProductController } from "./product.controller";
import { isAuthenticated } from "../auth/auth.middleware"; // Import the middleware


const router = Router();

// Apply isAuthenticated for create, update, and delete routes
router.post("/", isAuthenticated, ProductController.create); // Only admins can create products
router.put("/:id", isAuthenticated, ProductController.update); // Only admins can update products
router.delete("/:id", isAuthenticated, ProductController.delete); // Only admins can delete products

// Public access to find all products and find by id
router.get("/", ProductController.findAll);
// router.get("/:id", ProductController.findById);
router.get("/search", ProductController.search);
router.get("/category", ProductController.getProductsByCategory);
export default router;
