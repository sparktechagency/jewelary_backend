
import { Request, Response, NextFunction } from "express";
import OrderModel from "../../models/order.model";
import UserModel from "../../models/user.model";
import mongoose from "mongoose";
import { io } from "../../../app"; // Adjust the path as needed
import ProductModel from "../../models/Product";
import multer from "multer";
import ProductAttribute from "../../models/attribute/ProductAttribute";
import ProductAttributeModel from "../../models/attribute/ProductAttribute";
import { uploadOrder } from "../multer/multer.conf";
import NotificationModel from "../../models/notificationModel";

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
        paidAmount = Number(paidAmount) || 0;
  
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
        const itemsWithDetails: any[] = [];
  
        for (const item of products) {
          const product = await ProductModel.findById(item.productId);
          if (!product) {
            return res.status(404).json({ message: `Product with ID ${item.productId} not found.` });
          }
  
          const matchingVariation = product.variations.find((v: any) =>
            v.color.toString() === item.color &&
            v.size.toString() === item.size &&
            v.thickness.toString() === item.thickness
          );
  
          if (!matchingVariation) {
            return res.status(400).json({
              message: `No variation with color ${item.color}, size ${item.size}, thickness ${item.thickness} is available for product ${product.name}.`
            });
          }
  
          if (product.availableQuantity < item.quantity) {
            return res.status(400).json({
              message: `Not enough stock for product ${product.name}. Available: ${product.availableQuantity}, Requested: ${item.quantity}`
            });
          }
  
          totalAmount += product.deliveryCharge + matchingVariation.price * item.quantity;
          product.availableQuantity -= item.quantity;
          await product.save();
  
          itemsWithDetails.push({
            productId: item.productId,
            quantity: item.quantity,
            variation: {
              color: matchingVariation.color,
              size: matchingVariation.size,
              thickness: matchingVariation.thickness,
              price: matchingVariation.price,
            }
          });
        }
  
        // ✅ **Ensure `paymentStatus` remains "Pending" until Stripe confirms it**
        let dueAmount: number = totalAmount - paidAmount;
        let paymentStatus: "Pending" | "Partial" | "Paid" = "Pending";
  
        if (paymentType === "full") {
       
          dueAmount = totalAmount; // Payment has not been received yet
          paidAmount = 0; // Stripe will update it later
        } else if (paymentType === "partial") {
          paymentStatus = "Partial"; // If partial payment is made
        } else if (paymentType === "cod") {
          dueAmount = totalAmount;
          paidAmount = 0;
          paymentStatus = "Pending"; // Cash on Delivery
        }
  
        let receiptUrls: string[] = [];
        if (req.files && (req.files as any)["receipts"]) {
          receiptUrls = (req.files as any)["receipts"].map((file: Express.Multer.File) => `/uploads/receipts/${file.filename}`);
        }
  
        const newOrder = new OrderModel({
          userId,
          items: itemsWithDetails,
          contactName,
          contactNumber,
          deliverTo,
          totalAmount,
          paidAmount, // 🚨 **Keep paidAmount = 0 for "full" payment until Stripe confirms it**
          dueAmount,
          paymentType,
          paymentStatus, // 🚨 **DO NOT set as "Paid" immediately!**
          receiptUrls,
          orderStatus: "pending",
        });
  
        await newOrder.save();
  
        return res.status(201).json({
          message: "Order placed successfully. Proceed to payment.",
          orderId: newOrder._id,
          paymentType,
          totalAmount,
          paidAmount,
          dueAmount,
          receiptUrls,
          items: itemsWithDetails,
        });
      } catch (error) {
        console.error("Order processing error:", error);
        next(error);
      }
    });
  },
  

  createCustomOrderByName: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userName, products, paymentType } = req.body;
      let paidAmt: number = Number(req.body.paidAmount) || 0;
  
      // Validate inputs
      if (!userName || !Array.isArray(products) || products.length === 0) {
        res.status(400).json({ message: "User name and product list are required." });
        return;
      }
  
      // Find user by name
      const user = await UserModel.findOne({ username: userName });
      if (!user) {
        res.status(404).json({ message: "User not found." });
        return;
      }
  
      const userId = user._id as mongoose.Types.ObjectId;
  
      let totalAmount = 0;
      // Validate each product and calculate total amount using product price from variations
      for (const item of products) {
        const product = await ProductModel.findById(item.productId).populate("variations.color").populate("variations.size").populate("variations.thickness");
  
        if (!product) {
          res.status(404).json({ message: `Product with ID ${item.productId} not found.` });
          return;
        }
  
        // Find the variation based on color, size, and thickness
        const variation = product.variations.find((v) =>
          v.color.toString() === item.color &&
          v.size.toString() === item.size &&
          v.thickness.toString() === item.thickness
        );
  
        if (!variation) {
          res.status(400).json({ message: `No matching variation found for product ${product.name}.` });
          return;
        }
  
        // Calculate the total amount using the variation price
        totalAmount += variation.price * item.quantity;
      }
  
      let dueAmount = totalAmount - paidAmt;
      let paymentStatus: "Pending" | "Partial" | "Paid" = "Pending";
  
      if (paymentType === "full") {
        dueAmount = 0;
        paymentStatus = "Paid";
      } else if (paymentType === "partial") {
        paymentStatus = dueAmount > 0 ? "Partial" : "Paid";
      } else if (paymentType === "cod") {
        dueAmount = totalAmount;
        paidAmt = 0;
        paymentStatus = "Pending";
      }
  
      // Fallback values for contact details if not provided
      const contactName = req.body.contactName || "Default Contact Name";
      const contactNumber = req.body.contactNumber || "0000000000";
      const deliverTo = req.body.deliverTo || "Default Address";
      const receiptUrls: string[] = [];
  
      // Create the order with items containing just productId, variation details, and quantity
      const newOrder = new OrderModel({
        userId,
        items: products.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
          thickness: item.thickness,
        })),
        contactName,
        contactNumber,
        deliverTo,
        totalAmount,
        paidAmount: paidAmt,
        dueAmount,
        paymentType,
        paymentStatus,
        receiptUrls,
        orderStatus: "pending",
      });
  
      await newOrder.save();
  
      // Optionally emit a notification to the user
      io.emit("orderStatusUpdate", {
        message: `Admin has created a custom order for you. Order ID: ${newOrder._id}. Please proceed to payment.`,
        orderId: newOrder._id,
      });
  
      res.status(201).json({
        message: "Custom order created successfully.",
        orderId: newOrder._id,
        totalAmount,
        paidAmount: paidAmt,
        dueAmount,
      });
    } catch (error) {
      console.error("Error creating custom order:", error);
      next(error);
    }
  },
  

  

  // getAllOrders: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   try {
  //     console.log("🔍 Fetching Orders...");
  
  //     // Extract status from query params
  //     const { status } = req.query;
  
  //     // Initialize a filter object
  //     let filter: any = {};
  
  //     // Apply order status filtering if a status is provided
  //     if (status) {
  //       filter.orderStatus = status.toString(); // Ensure it's a string
  //     }
  
  //     // Fetch orders using the filter
  //     const orders = await OrderModel.find(filter).populate("items.productId").lean();
  //     console.log("🔹 Orders Found:", orders.length);
  
  //     const ordersWithPaymentType = orders.map(order => ({
  //       ...order,
  //       paymentType: order.paymentStatus === "Paid" ? "full" : order.paymentStatus === "Partial" ? "partial" : "cod",
  //     }));

  //     if (orders.length === 0) {
  //       res.status(404).json({ message: "No orders found for the specified status." });
  //       return;
  //     }
  
  //     res.status(200).json({  orders: ordersWithPaymentType });
  //   } catch (error) {
  //     console.error("Error Fetching Orders:", error);
  //     next(error);
  //   }
  // },
  
  getAllOrders: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log("🔍 Fetching Orders...");
  
      // Extract status from query params
      const { status } = req.query;
  
      // Initialize a filter object
      let filter: any = {};
  
      // Apply order status filtering if a status is provided
      if (status) {
        filter.orderStatus = status.toString(); // Ensure it's a string
      }
  
      // Fetch orders with user details populated
      const orders = await OrderModel.find(filter)
        .populate("items.productId")
        .populate("userId", "username email phone") // Populate user details
        .lean();
  
      console.log("🔹 Orders Found:", orders.length);
  
      const ordersWithPaymentType = orders.map(order => ({
        ...order,
        paymentType:
          order.paymentStatus === "Paid"
            ? "full"
            : order.paymentStatus === "Partial"
            ? "partial"
            : "cod",
      }));
  
      if (orders.length === 0) {
        res.status(404).json({ message: "No orders found for the specified status." });
        return;
      }
  
      res.status(200).json({ orders: ordersWithPaymentType });
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
        .select("items totalAmount paidAmount dueAmount paymentStatus orderStatus createdAt");
  
      res.status(200).json({ orders });
    } catch (error) {
      next(error);
    }
  },  

  getOrderRequest: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Filter for orders with 'pending' order status
      const filter: any = { orderStatus: "pending" };
  
      // Fetch orders with user and product details populated
      const orders = await OrderModel.find(filter)
        .populate("items.productId")  // Populate product details
        .populate("userId", "username email phone")  // Populate user details
        .lean();
  
      console.log("🔹 Pending Orders Found:", orders.length);
  
      // If no pending orders are found, return a 404 response
      if (orders.length === 0) {
         res.status(404).json({ message: "No pending orders found." });
         return
      }
  
      // Return the pending orders along with the total count of pending orders
      res.status(200).json({
        totalCount: orders.length,
        orders
      });
    } catch (error) {
      console.error("Error Fetching 'pending' Orders:", error);
      next(error);
    }
  },
  

  // Get Order Complete Status Orders
  getCompleteOrder: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Filter for orders with "complete" status
      const filter: any = { orderStatus: "complete" };
  
      // Fetch complete orders with user and product details populated
      const orders = await OrderModel.find(filter)
        .populate("items.productId")  // Populate product details
        .populate("userId", "username email phone")  // Populate user details
        .lean();
  
      if (orders.length === 0) {
         res.status(404).json({ message: "No orders found for the 'complete' status." });
         return
      }
  
      // Return the complete orders along with the total count of complete orders
      res.status(200).json({
        totalCount: orders.length,
        orders
      });
    } catch (error) {
      console.error("Error Fetching 'complete' Orders:", error);
      next(error);
    }
  },
  

  // getPartialOrder: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   try {
  //     // Extract status from query params if needed (for now we assume we're specifically checking for partial orders)
  //     const filter: any = {
  //       orderStatus: "pending",  // You can filter by pending orders if needed (remove this if you want all partial orders)
  //       paymentStatus: "Partial" // Filter by orders with Partial payment status
  //     };
  
  //     // Fetch only partial orders with user and product details populated
  //     const orders = await OrderModel.find(filter)
  //       .populate("items.productId")  // Populate product details
  //       .populate("userId", "username email phone")  // Populate user details
  //       .lean();
  
  //     // Log the number of orders found for debugging
  //     console.log("🔹 Partial Orders Found:", orders.length);
  
  //     // Check if no orders were found
  //     if (orders.length === 0) {
  //        res.status(404).json({ message: "No partial orders found." });
  //        return
  //     }
  
  //     // Map through orders to add paymentType based on paymentStatus
  //     const ordersWithPaymentType = orders.map((order) => ({
  //       ...order,
  //       paymentType:
  //         order.paymentStatus === "Paid"
  //           ? "full"
  //           : order.paymentStatus === "Partial"
  //           ? "partial"
  //           : "cod",
  //     }));
  
  //     // Return the partial orders along with user and product details
  //     res.status(200).json({ orders: ordersWithPaymentType });
  //   } catch (error) {
  //     console.error("Error Fetching 'Partial' Orders:", error);
  //     next(error);
  //   }
  // },
  

 
  

  
  // Get Custom Order Status Orders
  getPartialOrder: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Filter for orders with "partial" payment status
      const filter: any = { paymentStatus: "Partial" };
  
      // Fetch partial orders with user and product details populated
      const orders = await OrderModel.find(filter)
        .populate("items.productId")  // Populate product details
        .populate("userId", "username email phone")  // Populate user details
        .lean();
  
      if (orders.length === 0) {
         res.status(404).json({ message: "No partial orders found." });
         return
      }
  
      // Return the partial orders along with the total count of partial orders
      res.status(200).json({
        totalCount: orders.length,
        orders
      });
    } catch (error) {
      console.error("Error Fetching 'Partial' Orders:", error);
      next(error);
    }
  },
  

  getCustomOrder: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orders = await OrderModel.find({ orderStatus: "custom" })
        .populate("items.productId")
        .populate("userId", "username email phone")
        .lean();

      if (orders.length === 0) {
         res.status(404).json({ message: "No orders found for the 'custom' status." });
         return
      }

      res.status(200).json({ orders });
    } catch (error) {
      console.error("Error Fetching 'custom' Orders:", error);
      next(error);
    }
  },

  // Get Total Order Status Orders
  getTotalOrder: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orders = await OrderModel.find({ orderStatus: "total" })
        .populate("items.productId")
        .populate("userId", "username email phone")
        .lean();

      if (orders.length === 0) {
         res.status(404).json({ message: "No orders found for the 'total' status." });
         return
      }

      res.status(200).json({ orders });
    } catch (error) {
      console.error("Error Fetching 'total' Orders:", error);
      next(error);
    }
  },

  getCancelledOrder: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Filter for orders with "cancelled" status
      const filter: any = { orderStatus: "cancelled" };
  
      // Fetch cancelled orders with user and product details populated
      const orders = await OrderModel.find(filter)
        .populate("items.productId")  // Populate product details
        .populate("userId", "username email phone")  // Populate user details
        .lean();
  
      if (orders.length === 0) {
         res.status(404).json({ message: "No orders found for the 'cancelled' status." });
         return
      }
  
      // Return the cancelled orders along with the total count of cancelled orders
      res.status(200).json({
        totalCount: orders.length,
        orders
      });
    } catch (error) {
      console.error("Error Fetching 'cancelled' Orders:", error);
      next(error);
    }
  },
  
  // updateOrderStatus: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   try {
  //     const orderId = req.params.id;
  //     const { status } = req.body; // Assuming 'status' is passed in the request body
      
  //     const allowedStatuses = ["pending", "running", "completed", "custom", "cancelled"];
  //     if (!allowedStatuses.includes(status)) {
  //       res.status(400).json({ message: "Invalid order status." });
  //       return;
  //     }

  //     // Retrieve the order from the database
  //     const order = await OrderModel.findById(orderId);
  //     if (!order) {
  //       res.status(404).json({ message: "Order not found." });
  //       return;
  //     }

  //     // Validate the transition based on current orderStatus
  //     if (order.orderStatus === "completed" && status !== "completed") {
  //        res.status(400).json({
  //         message: "Order is already completed. Cannot change to another status."
  //       });
  //     }

  //     if (order.orderStatus === "cancelled" && status !== "cancelled") {
  //        res.status(400).json({
  //         message: "Order is cancelled. Cannot change to another status."
  //       });
  //     }

  //     // If the status is valid, update the order status
  //     order.orderStatus = status;
  //     await order.save();

  //     // Emit a socket event to the user's room (using receiptUrls for fileName if available)
  //     io.to(order.userId.toString()).emit("orderStatusUpdate", {
  //       orderId: order._id,
  //       orderStatus: status,
  //       fileName: order.receiptUrls && order.receiptUrls.length > 0 ? order.receiptUrls[0] : "",
  //       message: `Your order has been ${status}.`
  //     });

  //     res.status(200).json({ message: "Order status updated successfully.", order });
  //   } catch (error) {
  //     next(error);
  //   }
  // },
 
  updateOrderStatus: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orderId = req.params.id;
      const { status } = req.body; // Assuming 'status' is passed in the request body

      // Valid status values for the order
      const allowedStatuses = ["pending", "running", "completed", "custom", "cancelled"];
      if (!allowedStatuses.includes(status)) {
        res.status(400).json({ message: "Invalid order status." });
        return;
      }

      // Retrieve the order from the database
      const order = await OrderModel.findById(orderId);
      if (!order) {
        res.status(404).json({ message: "Order not found." });
        return;
      }

      // Validate the transition based on current orderStatus
      if (order.orderStatus === "completed" && status !== "completed") {
        res.status(400).json({
          message: "Order is already completed. Cannot change to another status."
        });
        return;
      }

      if (order.orderStatus === "cancelled" && status !== "cancelled") {
        res.status(400).json({
          message: "Order is cancelled. Cannot change to another status."
        });
        return;
      }

      // If the status is valid, update the order status
      order.orderStatus = status;
      await order.save();

      // Create a notification for the user
      const notificationMessage = `Your order with ID ${orderId} has been updated to ${status}.`;

      const notification = new NotificationModel({
        userId: order.userId, // Assuming the order has a reference to user
        message: notificationMessage,
        seen: false, // Notifications are not seen initially
      });

      await notification.save(); // Save the notification to the database

      // Respond with success and the updated order
      res.status(200).json({
        message: "Order status updated successfully.",
        order,
        notification: notificationMessage,
      });
    } catch (error) {
      console.error("Error updating order status:", error);
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

export const { placeOrder, getAllOrders, getOrderStatus, updateOrderStatus, deleteOrder,createCustomOrderByName } = OrderController;

