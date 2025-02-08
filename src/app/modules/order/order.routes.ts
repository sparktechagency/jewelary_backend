import { Router } from "express";
import { OrderController } from "./order.controller";
import { isAuthenticated, isAdmin } from "../auth/auth.middleware";

const router = Router();

// User routes
router.post("/place-order", isAuthenticated, OrderController.placeOrder);
router.get("/my-orders", isAuthenticated, OrderController.getOrderStatus);
// Admin routes
router.get("/", isAuthenticated, isAdmin, OrderController.getAllOrders);
router.put("/update-status", isAuthenticated, isAdmin, OrderController.updateOrderStatus);
router.delete("/:orderId", isAuthenticated, isAdmin, OrderController.deleteOrder);
//custom order routes
// Admin route to create a custom order
router.post("/create-custom-order", isAuthenticated, isAdmin, OrderController.createCustomOrderByName);

export default router;
