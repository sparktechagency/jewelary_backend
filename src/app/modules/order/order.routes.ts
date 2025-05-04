import { Router } from "express";
import { OrderController } from "./order.controller";
import { isAuthenticated, isAdmin, verifyToken } from "../auth/auth.middleware";
import { getMyOrders } from "./order.status";
import { verify } from "crypto";


const router = Router();

// User routes
router.post("/place-order", isAuthenticated,verifyToken, OrderController.placeOrder);
// router.get("/my-orders", isAuthenticated, OrderController.getOrderStatus);
router.get("/my-orders", isAuthenticated, getMyOrders);

router.get("/orderRequest", isAuthenticated, isAdmin, OrderController.getOrderRequest);

// Route for fetching all "order complete" status orders
router.get("/orderComplete", isAuthenticated, isAdmin, OrderController.getCompleteOrder);

// Route for fetching all "partial order" status orders
router.get("/partialOrder", isAuthenticated, isAdmin, OrderController.getPartialOrder);

// Route for fetching all "custom order" status orders
router.get("/customOrder", isAuthenticated, isAdmin, OrderController.getCustomOrder);
router.get("/orders/custom", OrderController.getFilteredCustomOrders);

// Route for fetching all "cancelled order" status orders
router.get("/cancelledOrder", isAuthenticated, isAdmin, OrderController.getCancelledOrder);

router.get("/orderStatusCounts", isAuthenticated, isAdmin, OrderController.getOrderStatusCounts);
router.get("/getPaymentPaid", isAuthenticated, isAdmin, OrderController.getPaymentPaid);
router.put("/order-action", isAuthenticated, OrderController.acceptOrCancelOrderController);
// Admin routes
router.get("/", isAuthenticated, isAdmin, OrderController.getAllOrders);
router.patch("/:id/update-status", isAuthenticated, isAdmin, OrderController.updateOrderStatus);
router.delete("/:orderId", isAuthenticated, isAdmin, OrderController.deleteOrder);

router.post("/create-custom-order", isAuthenticated, isAdmin, OrderController.createCustomOrderByName);
router.get("/running-order", isAuthenticated, isAdmin, OrderController.getRunningOrders);


export default router;
