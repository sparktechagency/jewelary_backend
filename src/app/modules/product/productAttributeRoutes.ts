import { Router } from "express";
import { ProductAttributeController } from "./productAttributeController";
import { isAdmin, isAuthenticated } from "../auth/auth.middleware";

const router = Router();

// Route to create product attributes (color, size, thickness, quantity)
router.post("/sizes", isAuthenticated,ProductAttributeController.createSize);  // POST request to create attributes
router.post("/color", isAuthenticated,ProductAttributeController.createColor);  // POST request to create attributes
router.post("/thikness", isAuthenticated,ProductAttributeController.createThickness);  // POST request to create attributes
router.put("/sizes/updates", isAuthenticated,ProductAttributeController.updateSize)
router.put("/color/updates",isAuthenticated, ProductAttributeController.updateColor)
router.put("/thikness/updates",isAuthenticated, ProductAttributeController.updateThickness)
router.get("/sizes",isAuthenticated, ProductAttributeController.getSizes)
router.get("/color",isAuthenticated,ProductAttributeController.getColors)
router.get("/Thikness",isAuthenticated,ProductAttributeController.getThickness)
// router.get("/sizes/inactive",isAuthenticated,ProductAttributeController.getInactiveSizes)
// router.get("/color/inactive",isAuthenticated, ProductAttributeController.getInactiveColors)
// router.get("/Thikness/inactive",isAuthenticated,ProductAttributeController.getActiveThickness)
router.delete("/thikness/:thicknessId",isAuthenticated,ProductAttributeController.deleteThickness)
router.delete("/color/:colorId",isAuthenticated,ProductAttributeController.deleteColor)
router.delete("/sizes/:sizeId",isAuthenticated,ProductAttributeController.deleteSize)
// router.get("/sizes/inactive")



// Route to get all product attributes
// router.get("/", isAuthenticated,ProductAttributeController.getAll);   // GET request to fetch all attributes

// Route to update a product attribute by ID
// router.put("/:id", isAuthenticated,ProductAttributeController.update); // PUT request to update attributes

// Route to delete a product attribute by ID
; // DELETE request to delete attributes

export default router;
