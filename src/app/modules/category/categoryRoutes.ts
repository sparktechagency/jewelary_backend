import { Router } from "express";
import { CategoryController } from "./category.controller";
import { isAuthenticated } from "../auth/auth.middleware";
import multer from "multer";
// import {storage} from '../multer/multer.conf'
// import multer from "multer";

const router = Router();

 
// Admin routes for managing categories
router.post("/", isAuthenticated, CategoryController.create);
// router.get("/", CategoryController.getCategories);
router.put("/:id", isAuthenticated, CategoryController.update);
router.delete("/:id", isAuthenticated, CategoryController.delete);
router.get("/count", CategoryController.getCategoriesWithProductCount);
router.get("/", CategoryController.getCategories);
router.get("/inventory", CategoryController.getAllCategoryProducts);
router.get("/inventory/:categoryId", CategoryController.getCategoryInventory);
// Public routes
router.get("/", CategoryController.findAll);
router.get("/:id", CategoryController.findById);


export default router;
