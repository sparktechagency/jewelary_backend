import { Router } from "express";
import { OrderController } from "./order.controller";
import { isAuthenticated, isAdmin } from "../auth/auth.middleware";

const router = Router();

// User routes
router.post("/place-order", isAuthenticated, OrderController.placeOrder);
router.get("/my-orders", isAuthenticated, OrderController.getOrderStatus);

// Admin routes
router.get("/orders", isAuthenticated, isAdmin, OrderController.getAllOrders);
router.put("/orders/update-status", isAuthenticated, isAdmin, OrderController.updateOrderStatus);
router.delete("/orders/:orderId", isAuthenticated, isAdmin, OrderController.deleteOrder);
// router.get("/debug-orders", isAuthenticated, isAdmin, OrderController.debugOrders);
export default router;
