
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
import ColorModel from "../../models/attribute/attribute.color";
import { sendInvoiceEmail } from './sendInvoiceEmail'; // Import sendInvoiceEmail
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { emailHelper } from "../mailer/invoice";

interface ProductItem {
  productId: mongoose.Types.ObjectId | string;
  quantity: number;
  color: mongoose.Types.ObjectId | string;
  size: mongoose.Types.ObjectId | string;
}

interface ValidationResult {
  isValid: boolean;
  message?: string;
  data?: any;
}



export const OrderController = {


  




//  placeOrder : async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   uploadOrder(req, res, async (err: any) => {
//     if (err) {
//       console.log('Multer Error:', err);
//       return res.status(400).json({ message: `Multer error: ${err.message}`, details: err });
//     }

//     console.log('Files:', req.files);
//     console.log('Body:', req.body);

//     try {
//       if (!req.user) {
//         return res.status(401).json({ message: 'Unauthorized: User not found.' });
//       }

//       let { contactName, contactNumber, deliverTo, paymentType, paidAmount } = req.body;
//       paidAmount = Number(paidAmount) || 0;

//       if (!contactName || !contactNumber || !deliverTo) {
//         return res.status(400).json({ message: 'Missing required fields: contactName, contactNumber, deliverTo.' });
//       }

//       const userId = (req.user as { id: string }).id;

//       let products;
//       try {
//         products = typeof req.body.products === 'string' ? JSON.parse(req.body.products) : req.body.products;
//       } catch (e) {
//         return res.status(400).json({ message: 'Invalid products format' });
//       }

//       if (!Array.isArray(products) || products.length === 0) {
//         return res.status(400).json({ message: 'Product list is required.' });
//       }

//       let totalAmount = 0;
//       const itemsWithDetails: any[] = [];

//       for (const item of products) {
//         const product = await ProductModel.findById(item.productId);
//         if (!product) {
//           return res.status(404).json({ message: `Product with ID ${item.productId} not found.` });
//         }

//         const matchingVariation = product.variations.find((v: any) =>
//           v.color.toString() === item.color &&
//           v.size.toString() === item.size
//         );

//         if (!matchingVariation) {
//           return res.status(400).json({
//             message: `No variation with color ${item.color}, size ${item.size} is available for product ${product.name}.`
//           });
//         }

//         if (product.availableQuantity < item.quantity) {
//           return res.status(400).json({
//             message: `Not enough stock for product ${product.name}. Available: ${product.availableQuantity}, Requested: ${item.quantity}`
//           });
//         }

//         totalAmount += product.deliveryCharge + matchingVariation.price * item.quantity;
//         product.availableQuantity -= item.quantity;
//         await product.save();

//         itemsWithDetails.push({
//           productId: item.productId,
//           quantity: item.quantity,
//           variation: {
//             color: matchingVariation.color,
//             size: matchingVariation.size,
//             price: matchingVariation.price,
//           }
//         });
//       }

//       let dueAmount: number = totalAmount - paidAmount;
//       let paymentStatus: 'Pending' | 'Partial' | 'Paid' = 'Pending';

//       if (paymentType === 'full') {
//         dueAmount = totalAmount;
//         paidAmount = 0;
//       } else if (paymentType === 'partial') {
//         paymentStatus = 'Partial';
//       } else if (paymentType === 'cod') {
//         dueAmount = totalAmount;
//         paidAmount = 0;
//         paymentStatus = 'Pending';
//       }

//       let receiptUrls: string[] = [];
//       if (req.files && (req.files as any)['receipts']) {
//         receiptUrls = (req.files as any)['receipts'].map((file: Express.Multer.File) => `/uploads/receipts/${file.filename}`);
//       }

//       const newOrder = new OrderModel({
//         userId,
//         items: itemsWithDetails,
//         contactName,
//         contactNumber,
//         deliverTo,
//         totalAmount,
//         paidAmount,
//         dueAmount,
//         paymentType,
//         paymentStatus,
//         receiptUrls,
//         orderStatus: 'pending',
//       });

//       await newOrder.save();

//       // Send email with invoice attached
//       const userEmail = req.user?.email;

//       if (!userEmail || typeof userEmail !== 'string') {
//         return res.status(400).json({ message: 'No valid email address found for user' });
//       }

//       await sendInvoiceEmail(userEmail, newOrder);  // Send the email with the invoice attached

//       return res.status(201).json({
//         message: 'Order placed successfully. Proceed to payment.',
//         orderId: newOrder._id,
//         paymentType,
//         totalAmount,
//         paidAmount,
//         dueAmount,
//         receiptUrls,
//         items: itemsWithDetails,
//       });
//     } catch (error) {
//       console.error('Order processing error:', error);
//       next(error);
//     }
//   });
// },

placeOrder: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  uploadOrder(req, res, async (err: any) => {
    if (err) {
      console.log('Multer Error:', err);
      return res.status(400).json({ message: `Multer error: ${err.message}`, details: err });
    }

    console.log('Files:', req.files);
    console.log('Body:', req.body);

    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized: User not found.' });
      }

      // Log the full user object for debugging
      console.log('User object:', req.user);
      console.log('User invoice setting:', req.user.invoice);  // Log invoice value

      let { contactName, contactNumber, deliverTo, paymentType, paidAmount } = req.body;
      paidAmount = Number(paidAmount) || 0;

      if (!contactName || !contactNumber || !deliverTo) {
        return res.status(400).json({ message: 'Missing required fields: contactName, contactNumber, deliverTo.' });
      }

      const userId = (req.user as { id: string }).id;

      let products;
      try {
        products = typeof req.body.products === 'string' ? JSON.parse(req.body.products) : req.body.products;
      } catch (e) {
        return res.status(400).json({ message: 'Invalid products format' });
      }

      if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ message: 'Product list is required.' });
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
          v.size.toString() === item.size
        );

        if (!matchingVariation) {
          return res.status(400).json({
            message: `No variation with color ${item.color}, size ${item.size} is available for product ${product.name}.`
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
            price: matchingVariation.price,
          }
        });
      }

      let dueAmount: number = totalAmount - paidAmount;
      let paymentStatus: 'Pending' | 'Partial' | 'Paid' = 'Pending';

      if (paymentType === 'full') {
        dueAmount = totalAmount;
        paidAmount = 0;
      } else if (paymentType === 'partial') {
        paymentStatus = 'Partial';
      } else if (paymentType === 'cod') {
        dueAmount = totalAmount;
        paidAmount = 0;
        paymentStatus = 'Pending';
      }

      let receiptUrls: string[] = [];
      if (req.files && (req.files as any)['receipts']) {
        receiptUrls = (req.files as any)['receipts'].map((file: Express.Multer.File) => `/uploads/receipts/${file.filename}`);
      }

      const newOrder = new OrderModel({
        userId,
        items: itemsWithDetails,
        contactName,
        contactNumber,
        deliverTo,
        totalAmount,
        paidAmount,
        dueAmount,
        paymentType,
        paymentStatus,
        receiptUrls,
        orderStatus: 'pending',
      });

      await newOrder.save();

      // Check the user's invoice status in the database
      const user = await UserModel.findById(userId).exec(); // Find the user by ID
      if (user && user.invoice === true) {  // Check if invoice is true
        if (req.user?.email) {  // Check if email is defined and not undefined
          console.log('Sending invoice email to:', req.user.email);
          await sendInvoiceEmail(req.user.email, newOrder);  // Send the email with the invoice attached
        } else {
          console.log('User email is missing or undefined.');
        }
      } else {
        console.log('Invoice email not sent because invoice is false or undefined.');
      }

      return res.status(201).json({
        message: 'Order placed successfully. Proceed to payment.',
        orderId: newOrder._id,
        paymentType,
        totalAmount,
        paidAmount,
        dueAmount,
        receiptUrls,
        items: itemsWithDetails,
      });
    } catch (error) {
      console.error('Order processing error:', error);
      next(error);
    }
  });
},








updateInvoice: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Check if user is authorized
    if (!req.user || !req.user.id) {
       res.status(401).json({ message: 'Unauthorized access' });
       return
    }

    // Get the 'invoice' value from the request body
    const { invoice } = req.body;

    // Ensure that 'invoice' is a boolean
    if (typeof invoice !== 'boolean') {
       res.status(400).json({ message: 'Invalid value for invoice. It should be a boolean.' });
       return
    }

    // Update the user's invoice setting
    const user = await UserModel.findByIdAndUpdate(req.user.id, { invoice }, { new: true });

    // If user not found, return 404
    if (!user) {
       res.status(404).json({ message: 'User not found.' });
       return
    }

    // Return success response with the updated invoice setting
     res.status(200).json({ message: 'Invoice setting updated successfully', invoice: user.invoice });
  } catch (error) {
    console.error('Error updating invoice setting:', error);
    next(error);
  }
},



 createCustomOrderByName :async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, products, paymentType, paidAmount, contactName, contactNumber } = req.body;
  
      const sanitizedEmail = email?.toString().trim();
      const paidAmt = Number(paidAmount) || 0;
  
      if (!sanitizedEmail) {
        res.status(400).json({ message: 'Email is required.' });
        return;
      }
  
      const user = await UserModel.findOne({ email: sanitizedEmail });
      if (!user) {
        res.status(404).json({ message: 'User not found.' });
        return;
      }
  
      if (!Array.isArray(products) || products.length === 0) {
        res.status(400).json({ message: 'Products must be provided.' });
        return;
      }
  
      const totalAmount = products.reduce((sum, product) => sum + Number(product.price || 0), 0);
  
      const paymentDetails = calculatePaymentDetails(totalAmount, paidAmt, paymentType);
  
      const newOrder = new OrderModel({
        userId: user._id,
        products,
        contactName: contactName || user.username,
        contactNumber: contactNumber || user.phoneNumber,
        deliverTo:  req.body.deliverTo || "Default Address",
        totalAmount,
        paidAmount: paymentDetails.paidAmount,
        dueAmount: paymentDetails.dueAmount,
        paymentType,
        paymentStatus: paymentDetails.paymentStatus,
        orderStatus: 'custom',
      });
  
      await newOrder.save();
  
      const notification = new NotificationModel({
        message: `Admin has created a custom order for you. Order ID: ${newOrder._id}. Please proceed to payment.`,
        userId: user._id,
        text: 'A custom order was created for you.',
        orderId: newOrder._id,
        orderStatus: 'custom',
        type: 'custom-order-created',
        seen: false,
      });
  
      await notification.save();
      const notificationd = await NotificationModel.findById(notification._id).lean();
  
      io.emit(`notification::${user._id}`, {
        message: `Admin has created a custom order for you. Order ID: ${newOrder._id}. Please proceed to payment.`,
        text: notification.message,
        type: 'custom-order-created',
        orderId: newOrder._id,
        orderStatus: 'custom',
      });
  
      res.status(200).json({
        success: true,
        message: 'Custom order created successfully.',
        orderDetails: newOrder, 
        notificationd,
      });
     
  
    } catch (error) {
      console.error('Error creating custom order:', error);
      res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Internal Server Error' });
    }
  },
  

 updateOrderStatus: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orderId = req.params.id;
      const { status } = req.body;
  
      const allowedStatuses = ["pending", "running", "completed", "custom", "custom:accepted", "custom:cancelled", "cancelled"];
      if (!allowedStatuses.includes(status)) {
         res.status(400).json({ message: "Invalid order status." });
         return
      }
  
      const order = await OrderModel.findById(orderId);
      if (!order) {
         res.status(404).json({ message: "Order not found." });
         return
      }
  
      order.orderStatus = status;
      await order.save();
  
      // ✅ Ensure `orderStatus` is stored in the notification
      const notificationMessage = `Your Order has been updated to ${status}.`;
      const notification = new NotificationModel({
        userId: order.userId,
        orderId: order._id,
        message: notificationMessage,
        orderStatus: status, // ✅ Ensure `orderStatus` is stored
        seen: false,
      });
  
      await notification.save();
  
      io.emit(`notification::${order.userId}`, {
        text: notificationMessage,
        type: "order-status-update",
        orderId: order._id,
        orderStatus: status,
      });
  
      res.status(200).json({
        message: "Order status updated successfully.",
        orderStatus: status,
        notification: notificationMessage,
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      next(error);
    }
  },  
  

// acceptOrCancelOrderController: async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { orderId, action } = req.body; // action: "accept" or "cancel"

//     // Find the order by ID
//     const order = await OrderModel.findById(orderId);
//     if (!order) {
//       res.status(404).json({ message: "Order not found." });
//       return;
//     }

//     // Validate action
//     if (!["accept", "cancel"].includes(action)) {
//       res.status(400).json({ message: "Invalid action. Use 'accept' or 'cancel'." });
//       return;
//     }

//     // ✅ Update order status
//     if (order.orderStatus === "custom") {
//       order.orderStatus = action === "accept" ? "custom:running" : "custom:cancelled";
//     } else {
//       order.orderStatus = action === "accept" ? "running" : "cancelled";
//     }

//     await order.save();

//     // ✅ Create an admin notification
//     const adminNotificationData: any = {
//       message: `User has ${action}ed Contact: ${order.contactName}.`,
//       Status: order.orderStatus,
//       type: `order-${action}`,
//       seen: false,
//     };

//     console.log("📌 Creating Admin Notification:", adminNotificationData);

//     const adminNotification = new NotificationModel(adminNotificationData);
//     await adminNotification.save();

//     console.log("✅ Admin Notification Saved:", adminNotification);

//     // ✅ Emit WebSocket notification
//     io.emit("admin-notification", {
//       text: `User has ${action}ed order ID: ${orderId}.`,
//       type: `order-${action}`,
//       orderId: order._id,
//       orderStatus: order.orderStatus,
//     });

//     res.status(200).json({ message: `Order ${action}ed successfully.`, orderStatus: order.orderStatus });

//   } catch (error) {
//     console.error("❌ Error processing order action:", error);
//     res.status(500).json({ message: "Error processing order action", error });
//   }
// },


acceptOrCancelOrderController : async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, action } = req.body; // action: "accept" or "cancel"
    const userId = req.user?.id; // Assuming authentication middleware sets req.user

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
      return;
    }

    // Find the order by ID
    const order = await OrderModel.findById(orderId);
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found." });
      return;
    }

    // Validate action
    if (!["accept", "cancel"].includes(action)) {
      res.status(400).json({ success: false, message: "Invalid action. Use 'accept' or 'cancel'." });
      return;
    }

    // ✅ Update order status
    if (order.orderStatus === "custom") {
      order.orderStatus = action === "accept" ? "custom:running" : "custom:cancelled";
    } else {
      order.orderStatus = action === "accept" ? "running" : "cancelled";
    }

    await order.save();

    // ✅ Create an admin notification with userId
    const adminNotificationData = {
      userId, // Attach the user ID
      message: `User ${userId} has ${action}ed order. Contact: ${order.contactName}.`,
      status: order.orderStatus,
      type: `order-${action}`,
      seen: false,
      createdAt: new Date(),
    };

    const adminNotification = new NotificationModel(adminNotificationData);
    await adminNotification.save();

    const eventName = `admin-notification::${userId}`;
    io.emit(eventName, {
      userId,
      text: `User ${userId} has ${action}ed order ID: ${orderId}.`,
      type: `order-${action}`,
      orderId: order._id,
      orderStatus: order.orderStatus,
    });

    res.status(200).json({
      success: true,
      message: `Order ${action}ed successfully.`,
      orderStatus: order.orderStatus,
    });

  } catch (error) {
    console.error("❌ Error processing order action:", error);
    res.status(500).json({ success: false, message: "Error processing order action", error });
  }
},



  

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
      .populate({
        path: "items.productId",  // Populate product details
        populate: [
          { path: "variations.color", model: "Color" },  // Populate color details
          { path: "variations.size", model: "Size" },  // Populate size details
          // { path: "variations.thickness", model: "Thickness" }  // Populate thickness details
        ]
      })
      .populate("userId", "username email phone")  // Populate user details
      .lean();

    console.log("🔹 Pending Orders Found:", orders.length);
  
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
        res.status(200).json({ orders});
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
        .populate({
          path: "items.productId",  // Populate product details
          populate: [
            { path: "variations.color", model: "Color" },  // Populate color details
            { path: "variations.size", model: "Size" },  // Populate size details
            // { path: "variations.thickness", model: "Thickness" }  // Populate thickness details
          ]
        })
        .populate("userId", "username email phone")  // Populate user details
        .lean();
  
      console.log("🔹 Pending Orders Found:", orders.length);
  
      // If no pending orders are found, return a 404 response
      if (orders.length === 0) {
        res.status(200).json({ orders});
        return;
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

  
  
  getCompleteOrder: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Filter for orders with 'complete' order status
      const filter: any = { orderStatus: "complete" };
  
      // Fetch complete orders with user and product details populated
      const orders = await OrderModel.find(filter)
      .populate({
        path: "items.productId",  // Populate product details
        populate: [
          { path: "variations.color", model: "Color" },  // Populate color details
          { path: "variations.size", model: "Size" },  // Populate size details
          // { path: "variations.thickness", model: "Thickness" }  // Populate thickness details
        ]
      })
      .populate("userId", "username email phone")  // Populate user details
      .lean();

    console.log("🔹 Pending Orders Found:", orders.length);
  
      // If no complete orders are found, return a 404 response
      if (orders.length === 0) {
         res.status(200).json({ orders});
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

  getPaymentPaid: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Filter for orders with "partial" payment status
      const filter: any = { paymentStatus: "Paid" };
  
      // Fetch partial orders with user and product details populated
      const orders = await OrderModel.find(filter)
        .populate("items.productId")  // Populate product details
        .populate("userId", "username email phone")  // Populate user details
        .lean();
  
      if (orders.length === 0) {
         res.status(404).json({ message: "No Paid orders found." });
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
         res.status(200).json({ orders: [] });
         return
      }

      res.status(200).json({ orders });
    } catch (error) {
      console.error("Error Fetching 'custom' Orders:", error);
      next(error);
    }
  },

  
 getFilteredCustomOrders : async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // ✅ Get custom statuses from query parameter
      let { status } = req.query;
  
      // Ensure status is always an array
      let statusArray: string[] = [];
      if (typeof status === "string") {
        statusArray = status.split(","); // Convert CSV format to array
      }
  
      // Validate input: Only allow status values that start with "custom"
      const validStatuses = statusArray.filter(s => s.startsWith("custom"));
  
      // Build query: If no valid statuses are provided, fetch all "custom"-related orders
      const query = validStatuses.length > 0 ? { orderStatus: { $in: validStatuses } } : { orderStatus: { $regex: "^custom" } };
  
      // ✅ Fetch orders based on query
      const orders = await OrderModel.find(query)
        .populate("items.productId")
        .populate("userId", "username email phone")
        .lean();
  
      res.status(200).json({ orders });
    } catch (error) {
      console.error("Error Fetching Custom Orders:", error);
      next(error);
    }
  },


  // getOrderStatusCounts: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   try {
  //     // Aggregate counts based on orderStatus and paymentStatus
  //     const orderCounts = await OrderModel.aggregate([
  //       {
  //         $match: { orderStatus: { $in: ["cancelled", "pending", "custom", "partial", "complete"] } }, // Filter for relevant statuses
  //       },
  //       {
  //         $group: {
  //           _id: "$orderStatus",  // Group by orderStatus field
  //           count: { $sum: 1 },   // Count the number of orders for each status
  //         },
  //       },
  //       {
  //         $project: {          // Project the orderStatus and count fields
  //           _id: 0,
  //           orderStatus: "$_id",
  //           count: 1,
  //         },
  //       },
  //     ]);
  
  //     // Initialize the result object with default values (0 for each status)
  //     const result = {
  //       totalOrders:0,
  //       cancelledOrder: 0,
  //       requestOrder: 0,  // Assuming 'pending' is 'order request'
  //       customOrder: 0,
  //       partialOrder: 0,
  //       completeOrder: 0,
  //     };
  
  //     // Map the aggregation result to our desired output structure
  //     orderCounts.forEach((item) => {
  //       if (item.orderStatus === "cancelled") result.cancelledOrder = item.count;
  //       if (item.orderStatus === "pending") result.requestOrder = item.count;  // Assuming 'pending' is 'order request'
  //       if (item.orderStatus === "custom") result.customOrder = item.count;
  //       if (item.orderStatus === "partial") result.partialOrder = item.count;
  //       if (item.orderStatus === "complete") result.completeOrder = item.count;
  //     });
  //     const totalOrdersAgg = await OrderModel.aggregate([
  //             { $count: "totalOrders" }  // Count all orders in the collection
  //           ]);
        
  //           result.totalOrders = totalOrdersAgg[0]?.totalOrders || 0;  
  
  //     // Also check for partial payment orders, as partial order might not be counted if only orderStatus is considered
  //     const partialPaymentOrders = await OrderModel.aggregate([
  //       { $match: { paymentStatus: "Partial" } },  // Only fetch orders with Partial payment status
  //       { $count: "partialOrderCount" },  // Count the partial orders
  //     ]);
  
  //     result.partialOrder += partialPaymentOrders[0]?.partialOrderCount || 0;
  
  //     // Return the counts of each order status
  //     res.status(200).json(result);
  //   } catch (error) {
  //     console.error("Error Fetching Order Status Counts:", error);
  //     next(error);
  //   }
  // },
 
  getOrderStatusCounts: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Aggregate counts based on orderStatus
      const orderCounts = await OrderModel.aggregate([
        {
          $match: {
            orderStatus: { $in: ["cancelled", "pending", "custom","custom:running", "partial", "complete"] }, // Filter for relevant statuses
          },
        },
        {
          $group: {
            _id: "$orderStatus",  // Group by orderStatus field
            count: { $sum: 1 },   // Count the number of orders for each status
          },
        },
        {
          $project: {          // Project the orderStatus and count fields
            _id: 0,
            orderStatus: "$_id",
            count: 1,
          },
        },
      ]);
  
      // Initialize the result object with default values (0 for each status)
      const result = {
        totalOrders: 0,
        cancelledOrder: 0,
        requestOrder: 0,  // Assuming 'pending' is 'order request'
        customOrder: 0,
        partialOrder: 0,
        completeOrder: 0,
      };
  
      // Map the aggregation result to our desired output structure
      orderCounts.forEach((item) => {
        if (item.orderStatus === "cancelled") result.cancelledOrder = item.count;
        if (item.orderStatus === "pending") result.requestOrder = item.count;  // Assuming 'pending' is 'order request'
        if (item.orderStatus === "custom") result.customOrder = item.count;
        if (item.orderStatus === "partial") result.partialOrder = item.count;
        if (item.orderStatus === "complete") result.completeOrder = item.count;
      });
  
      // Get the total number of orders in the collection (all order statuses)
      const totalOrdersAgg = await OrderModel.aggregate([
        { $count: "totalOrders" }  // Count all orders in the collection
      ]);
  
      result.totalOrders = totalOrdersAgg[0]?.totalOrders || 0;
  
      // Also check for partial payment orders, as partial order might not be counted if only orderStatus is considered
      const partialPaymentOrders = await OrderModel.aggregate([
        { $match: { paymentStatus: "Partial" } },  // Only fetch orders with Partial payment status
        { $count: "partialOrderCount" },  // Count the partial orders
      ]);
  
      result.partialOrder += partialPaymentOrders[0]?.partialOrderCount || 0;
  
      // Return the counts of each order status
      res.status(200).json(result);
    } catch (error) {
      console.error("Error Fetching Order Status Counts:", error);
      next(error);
    }
  },
  
   getRunningOrders : async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const runningOrders = await OrderModel.find({
        orderStatus: { $in: ["running", "custom:running"] }
      })
        .populate("userId", "name email") // Populate user info (optional)
        .populate("items.productId", "name") // Populate product info (optional)
        .populate("items.variation.color")   // Populate variation color
        .populate("items.variation.size")    // Populate variation size
        .sort({ createdAt: -1 }); // Optional: newest first
  
      res.status(200).json({
        message: "Running orders fetched successfully",
        count: runningOrders.length,
        orders: runningOrders,
      });
    } catch (error) {
      console.error("Error fetching running orders:", error);
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
         res.status(200).json({orders});
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

async function validateProducts(products: ProductItem[]): Promise<ValidationResult> {
  let validatedItems = [];
  let totalAmount = 0;
  
  try {
    for (const item of products) {
      if (!item.productId || !item.color || !item.size || !item.quantity) {
        return {
          isValid: false,
          message: "Each product must have productId, color, size, and quantity."
        };
      }
      
      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        return {
          isValid: false,
          message: "Product quantity must be a positive number."
        };
      }
      
      // Find the product
      const product = await ProductModel.findById(item.productId)
        .populate("variations.color")
        .populate("variations.size")
        // .session(session);
      
      if (!product) {
        return {
          isValid: false,
          message: `Product with ID ${item.productId} not found.`
        };
      }
      
      // Filter out inactive variations
      const activeVariations = product.variations.filter((v: any) =>
        v.color.active && v.size.active
      );
      
      if (activeVariations.length === 0) {
        return {
          isValid: false,
          message: `No active variations found for product ${product.name}.`
        };
      }
      
      // Find the matching variation
      const variation = activeVariations.find((v: any) =>
        v.color._id.toString() === item.color.toString() &&
        v.size._id.toString() === item.size.toString()
      );
      
      if (!variation) {
        // Get available variations info
        const availableVariations = await Promise.all(
          activeVariations.map(async (v: any) => ({
            color: v.color._id,
            colorName: (await ColorModel.findById(v.color))?.colorName,
            size: v.size._id,
            sizeName: v.size,
            price: v.price
          }))
        );
        
        return {
          isValid: false,
          message: `No matching variation found for product ${product.name}.`,
          data: { availableVariations }
        };
      }
      
      // Calculate the total amount using the variation price
      totalAmount += variation.price * item.quantity;
      
      // Format the item according to the schema
      validatedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        variation: {
          color: item.color,
          size: item.size
        }
      });
    }
    
    return {
      isValid: true,
      data: { validatedItems, totalAmount }
    };
    
  } catch (error) {
    throw error; // Let the calling function handle this error
  }
}

function calculatePaymentDetails(totalAmount: number, paidAmt: number, paymentType: string) {
  let dueAmount = totalAmount - paidAmt;
  let paymentStatus: "Pending" | "Partial" | "Paid" = "Pending";
  
  switch (paymentType) {
    case "full":
      dueAmount = 0;
      paidAmt = totalAmount;
      paymentStatus = "Paid";
      break;
    
    case "partial":
      if (paidAmt <= 0) {
        paymentStatus = "Pending";
      } else if (paidAmt >= totalAmount) {
        dueAmount = 0;
        paidAmt = totalAmount;
        paymentStatus = "Paid";
      } else {
        paymentStatus = "Partial";
      }
      break;
    
    case "cod":
      dueAmount = totalAmount;
      paidAmt = 0;
      paymentStatus = "Pending";
      break;
  }
  
  return {
    dueAmount,
    paidAmount: paidAmt,
    paymentStatus
  };
}

function formatValidationError(error: mongoose.Error.ValidationError) {
  const formattedErrors: Record<string, string> = {};
  
  for (const field in error.errors) {
    formattedErrors[field] = error.errors[field].message;
  }
  
  return formattedErrors;
}


export const { placeOrder, getAllOrders, getOrderStatus, updateOrderStatus, deleteOrder,createCustomOrderByName } = OrderController;

function next(error: unknown) {
  throw new Error("Function not implemented.");
}

