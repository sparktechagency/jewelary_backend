
import { Request, Response, NextFunction } from "express";
import OrderModel from "../../models/order.model";
import UserModel from "../../models/user.model";
import mongoose from "mongoose";
import { io } from "../../../app"; // Adjust the path as needed
import ProductModel from "../../models/Product";
import multer from "multer";
import ProductAttribute from "../../models/ProductAttribute";
import ProductAttributeModel from "../../models/ProductAttribute";
import { uploadOrder } from "../multer/multer.conf";

export const OrderController = {


  placeOrder: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    uploadOrder(req, res, async (err: any) => {
      if (err) {
        console.log("Multer Error:", err);
        return res.status(400).json({ message: `Multer error: ${err.message}`, details: err });
      }

      console.log("Files:", req.files);
      console.log("Body:", req.body);

      try {
        if (!req.user) {
          return res.status(401).json({ message: "Unauthorized: User not found." });
        }

        let { contactName, contactNumber, deliverTo, paymentType, paidAmount } = req.body;

        // ✅ Convert numeric values
        paidAmount = Number(paidAmount) || 0;

        // ✅ Validate required fields
        if (!contactName || !contactNumber || !deliverTo) {
          return res.status(400).json({ message: "Missing required fields: contactName, contactNumber, deliverTo." });
        }

        const userId = (req.user as { id: string }).id;

        let products;
        try {
          products = typeof req.body.products === "string" ? JSON.parse(req.body.products) : req.body.products;
        } catch (e) {
          return res.status(400).json({ message: "Invalid products format" });
        }

        if (!Array.isArray(products) || products.length === 0) {
          return res.status(400).json({ message: "Product list is required." });
        }

        let totalAmount = 0;
        for (const item of products) {
          const product = await ProductModel.findById(item.productId);
          if (!product) {
            return res.status(404).json({ message: `Product with ID ${item.productId} not found.` });
          }

          // 🔥 Ensure minimum order quantity is met
          if (item.quantity < product.minimumOrderQuantity) {
            return res.status(400).json({
              message: `You must order at least ${product.minimumOrderQuantity} units of ${product.name}.`,
            });
          }

          totalAmount += product.variations[0].price * item.quantity;
        }

        let dueAmount: number = totalAmount - paidAmount;
        let paymentStatus: "Pending" | "Partial" | "Paid" = "Pending";

        if (paymentType === "full") {
          dueAmount = 0;
          paymentStatus = "Paid";
        } else if (paymentType === "partial") {
          paymentStatus = dueAmount > 0 ? "Partial" : "Paid";
        } else if (paymentType === "cod") {
          dueAmount = totalAmount;
          paidAmount = 0;
          paymentStatus = "Pending";
        }

        // ✅ Extract uploaded receipt file paths
        let receiptUrls: string[] = [];
        if (req.files && (req.files as any)["receipts"]) {
          receiptUrls = (req.files as any)["receipts"].map((file: Express.Multer.File) => `/uploads/receipts/${file.filename}`);
        }

        const newOrder = new OrderModel({
          userId,
          items: products.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          contactName,
          contactNumber,
          deliverTo,
          totalAmount,
          paidAmount,
          dueAmount,
          paymentStatus,
          receiptUrls,
          orderStatus: "pending",
        });

        await newOrder.save();

        return res.status(201).json({
          message: "Order placed successfully. Proceed to payment.",
          orderId: newOrder._id,
          totalAmount,
          paidAmount,
          dueAmount,
          receiptUrls,
        });
      } catch (error) {
        console.error("Order processing error:", error);
        next(error);
      }
    });
  },



  createCustomOrderByName: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userName, products, paymentType, paidAmount } = req.body;
  
      // Validate inputs
      if (!userName || !Array.isArray(products) || products.length === 0) {
         res.status(400).json({ message: "User name and product list are required." });
      }
  
      // Find user by name
      const user = await UserModel.findOne({ username: userName });
      if (!user) {
         res.status(404).json({ message: "User not found." });
      }
  
      // Get the user ID
      if (!user) {
        res.status(404).json({ message: "User not found." });
        return;
      }
      const userId = user._id as mongoose.Types.ObjectId;
  
      let totalAmount = 0;
      // Validate each product
      for (const item of products) {
        const product = await ProductModel.findById(item.productId);
        if (!product) {
           res.status(404).json({ message: `Product with ID ${item.productId} not found.` });
          return;
          }
        
        // Handle missing variations
        if (!product.variations || product.variations.length === 0) {
           res.status(400).json({ message: `Product with ID ${item.productId} has no variations. Please ensure variations are set.` });
          return;
          }
        
        // Calculate the total amount using the first variation
        const variation = product.variations[0];
        if (!variation.price) {
          res.status(400).json({ message: `Product with ID ${item.productId} has no price in its variations.` });
       return;
        }
        
        // Calculate total amount
        totalAmount += variation.price * item.quantity;
        
        
        // Calculate the total amount
        totalAmount += variation.price * item.quantity;
        

      }
  
      let dueAmount = totalAmount - (paidAmount || 0);
      let paidAmounts: number = Number(req.body.paidAmount) || 0;
      
      let paymentStatus: "Pending" | "Partial" | "Paid" = "Pending";
  
      if (paymentType === "full") {
        dueAmount = 0;
        paymentStatus = "Paid";
      } else if (paymentType === "partial") {
        paymentStatus = dueAmount > 0 ? "Partial" : "Paid";
      } else if (paymentType === "cod") {
        dueAmount = totalAmount;
        paidAmounts = 0;
        paymentStatus = "Pending";
      }
  
      // Create the order
      const newOrder = new OrderModel({
        userId,
        items: products.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        totalAmount,
        paidAmount: paidAmount || 0,
        dueAmount,
        paymentStatus,
        orderStatus: "pending",
      });
  
      await newOrder.save();
  
      // Optionally, emit notification to user (e.g., using Socket.io or a different notification method)
      io.emit("orderStatusUpdate", {
        message: `Admin has created a custom order for you. Order ID: ${newOrder._id}. Please proceed to payment.`,
        orderId: newOrder._id,
      });
  
      res.status(201).json({
        message: "Custom order created successfully.",
        orderId: newOrder._id,
        totalAmount,
        paidAmount,
        dueAmount,
      });
    } catch (error) {
      console.error("Error creating custom order:", error);
      next(error);
    }
  },
  
  
  getAllOrders: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log("🔍 Fetching Orders...");
      const orders = await OrderModel.find().populate("userId items.productId").lean();
      console.log("🔹 Orders Found:", orders.length);
      if (!orders || orders.length === 0) {
        res.status(404).json({ message: "No orders found." });
        return;
      }
      res.status(200).json({ orders });
    } catch (error) {
      console.error("Error Fetching Orders:", error);
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
      const validStatuses = ["pending", "accepted", "cancelled", "shipped", "delivered"];
      if (!validStatuses.includes(status)) {
        res.status(400).json({ message: "Invalid order status." });
        return;
      }
      const order = await OrderModel.findById(orderId).populate("items.productId");
      if (!order) {
        console.error("Order Not Found");
        res.status(404).json({ message: "Order not found." });
        return;
      }
      // If order is accepted, update product quantities
      if (status === "accepted") {
        for (const item of order.items) {
          const product = await ProductModel.findById(item.productId);
          if (product) {
            if (product.availableQuantity >= item.quantity) {
              product.availableQuantity -= item.quantity;
              await product.save();
            } else {
              res.status(400).json({ message: `Not enough stock for product: ${product.name}` });
              return;
            }
          }
        }
      }
      order.orderStatus = status;
      await order.save();
      console.log("✅ Order Updated:", order);
      io.to(order.userId.toString()).emit("orderStatusUpdate", {
        message: `Your order status has been updated to ${status}.`,
        orderId: order._id,
        status,
      });
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
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        console.error("Invalid Order ID Format:", orderId);
        res.status(400).json({ message: "Invalid order ID format." });
        return;
      }
      const existingOrder = await OrderModel.findById(orderId);
      if (!existingOrder) {
        console.error("Order Not Found:", orderId);
        res.status(404).json({ message: "Order not found." });
        return;
      }
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
          createdAt: deletedOrder.createdAt,
        },
      });
    } catch (error) {
      console.error("Error in Delete Operation:", error);
      next(error);
    }
  },
};

export const { placeOrder, getAllOrders, getOrderStatus, updateOrderStatus, deleteOrder } = OrderController;

