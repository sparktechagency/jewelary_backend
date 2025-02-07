import express from "express";
import { PaymentController } from "../app/modules/payment/payment.controller";
import { isAdmin, isAuthenticated } from "../app/modules/auth/auth.middleware";
import { ProductAttributeController } from "../app/modules/product/productAttributeController";
import { UserController } from "../app/modules/user/user.controller";
// import { EarningsController } from "../app/modules/earning/controller";


const router = express.Router();

// View all payments

router.post( "/product-attributes",isAuthenticated, isAdmin,ProductAttributeController.create); // Protected route for creating product attributes
router.get("/admin/payments", isAuthenticated, PaymentController.viewPayments);
router.get("/admin/payments/:id", isAuthenticated, PaymentController.viewPayments);
router.get( "/product-attributes", isAuthenticated, isAdmin, ProductAttributeController.getAll ); // Protected route for fetching product attributes
router.get("/auth/count",isAuthenticated, isAdmin, UserController.getTotalUsers)
router.put("/product-attributes/:id", isAuthenticated, isAdmin, ProductAttributeController.update); // Protected route for updating product attributes
router.delete("/product-attributes/:id", isAuthenticated, isAdmin, ProductAttributeController.delete); // Protected route for deleting product attributes


export default router;
