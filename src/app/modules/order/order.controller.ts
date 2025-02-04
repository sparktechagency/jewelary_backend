import { Request, Response, NextFunction } from "express";
import OrderModel from "../../models/order.model";
import UserModel from "../../models/user.model";
import mongoose from "mongoose";

export const OrderController = {
  placeOrder: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req.user as { id: string }).id;

      // Fetch user cart
      const user = await UserModel.findById(userId).populate("cart.productId");
      if (!user || user.cart.length === 0) {
        res.status(400).json({ message: "Cart is empty or user not found." });
        return;
      }

      // Calculate total amount
      const totalAmount = user.cart.reduce((sum, item) => {
        const product = item.productId as unknown as { price: number };
        return sum + product.price * item.quantity;
      }, 0);

      // Create new order with "Pending" payment status
      const newOrder = new OrderModel({
        userId,
        items: user.cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        totalAmount,
        paymentStatus: "Pending",
      });

      await newOrder.save();

      res.status(201).json({
        message: "Order placed successfully. Proceed to payment.",
        orderId: newOrder._id,
        totalAmount,
      });
    } catch (error) {
      next(error);
    }
  },

  getAllOrders: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log("🔍 Fetching Orders..."); // Debugging log
  
      const orders = await OrderModel.find().populate("userId items.productId").lean();
  
      console.log("🔹 Orders Found:", orders.length); // Debugging log
  
      if (!orders || orders.length === 0) {
        res.status(404).json({ message: "No orders found." });
        return;
      }
  
      res.status(200).json({ orders });
    } catch (error) {
      console.error("Error Fetching Orders:", error); // Debugging log
      next(error);
    }
  },
  

  getOrderStatus: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req.user as { id: string }).id;
      const orders = await OrderModel.find({ userId })
        .populate("items.productId")
        .select("items totalAmount paymentStatus orderStatus createdAt");

      res.status(200).json({ orders });
    } catch (error) {
      next(error);
    }
  },
  
  updateOrderStatus: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orderId, status } = req.body;
  
      console.log("🔍 Updating Order:", { orderId, status });
  
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        res.status(400).json({ message: "Invalid order ID format." });
        return;
      }
  
      const validStatuses = ["Processing", "Shipped", "Delivered", "Cancelled"];
      if (!validStatuses.includes(status)) {
        res.status(400).json({ message: "Invalid order status." });
        return;
      }
  
      const order = await OrderModel.findByIdAndUpdate(
        orderId,
        { orderStatus: status },
        { new: true }
      );
  
      if (!order) {
        console.error("Order Not Found");
        res.status(404).json({ message: "Order not found." });
        return;
      }
  
      console.log("✅ Order Updated:", order);
      res.status(200).json({ message: "Order status updated successfully.", order });
    } catch (error) {
      console.error("Error Updating Order:", error);
      next(error);
    }
  },
  
  deleteOrder: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orderId } = req.params;
  
      console.log("🗑️ Attempting to delete Order:", orderId);
  
      // Validate orderId format
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        console.error("Invalid Order ID Format:", orderId);
        res.status(400).json({ message: "Invalid order ID format." });
        return;
      }
  
      // First find the order to make sure it exists
      const existingOrder = await OrderModel.findById(orderId);
      
      if (!existingOrder) {
        console.error("Order Not Found:", orderId);
        res.status(404).json({ message: "Order not found." });
        return;
      }

      // Perform the deletion
      const deletedOrder = await OrderModel.findByIdAndDelete(orderId);
      
      if (!deletedOrder) {
        console.error("Error During Order Deletion");
        res.status(500).json({ message: "Error deleting order." });
        return;
      }
  
      console.log("✅ Order Successfully Deleted:", deletedOrder);
      res.status(200).json({ 
        message: "Order deleted successfully.",
        deletedOrder: {
          id: deletedOrder._id,
          items: deletedOrder.items,
          totalAmount: deletedOrder.totalAmount,
          createdAt: deletedOrder.createdAt
        }
      });
    } catch (error) {
      console.error("Error in Delete Operation:", error);
      next(error);
    }
  },
  
  
  
};

export const { placeOrder, getAllOrders, getOrderStatus, updateOrderStatus, deleteOrder } = OrderController;
