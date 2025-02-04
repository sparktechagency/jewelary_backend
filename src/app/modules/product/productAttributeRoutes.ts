import { Router } from "express";
import { ProductAttributeController } from "./productAttributeController";
import { isAdmin, isAuthenticated } from "../auth/auth.middleware";

const router = Router();

// Route to create product attributes (color, size, thickness, quantity)
router.post("/", isAdmin,isAuthenticated,ProductAttributeController.create);  // POST request to create attributes

// Route to get all product attributes
router.get("/", isAdmin,isAuthenticated,ProductAttributeController.getAll);   // GET request to fetch all attributes

// Route to update a product attribute by ID
router.put("/:id", isAdmin,isAuthenticated,ProductAttributeController.update); // PUT request to update attributes

// Route to delete a product attribute by ID
router.delete("/:id", isAdmin,isAuthenticated,ProductAttributeController.delete); // DELETE request to delete attributes

export default router;
