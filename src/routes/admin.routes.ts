import express from "express";
import { PaymentController } from "../app/modules/payment/payment.controller";
import { isAdmin, isAuthenticated } from "../app/modules/auth/auth.middleware";
import { ProductAttributeController } from "../app/modules/product/productAttributeController";

const router = express.Router();

// View all payments
router.get("/admin/payments", isAuthenticated, PaymentController.viewPayments);
router.post(
    "/product-attributes",isAuthenticated, isAdmin,ProductAttributeController.create
  ); // Protected route for creating product attributes
  
  router.get(
    "/product-attributes", isAuthenticated, isAdmin, ProductAttributeController.getAll
  ); // Protected route for fetching product attributes
  

// You can add more admin-related routes here (e.g., manage users, orders, etc.)

export default router;
