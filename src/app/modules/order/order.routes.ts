import { Router } from "express";
import { OrderController } from "./order.controller";
import { isAuthenticated, isAdmin } from "../auth/auth.middleware";
import { getMyOrders } from "./order.status";


const router = Router();

// User routes
router.post("/place-order", isAuthenticated, OrderController.placeOrder);
// router.get("/my-orders", isAuthenticated, OrderController.getOrderStatus);
router.get("/my-orders", isAuthenticated, getMyOrders);

// Admin routes
router.get("/", isAuthenticated, isAdmin, OrderController.getAllOrders);
router.patch("/:id/update-status", isAuthenticated, isAdmin, OrderController.updateOrderStatus);
router.delete("/:orderId", isAuthenticated, isAdmin, OrderController.deleteOrder);
//custom order routes
// Admin route to create a custom order
router.post("/create-custom-order", isAuthenticated, isAdmin, OrderController.createCustomOrderByName);
// router.get("/orders/status/:status", isAuthenticated, getMyOrders);

export default router;
