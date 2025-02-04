import { Router } from "express";
import authRoutes from "../app/modules/auth/auth.routes";
import productRoutes from "../app/modules/product/product.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);

export default router;
