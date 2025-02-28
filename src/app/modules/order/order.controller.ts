
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
            v.size.toString() === item.size 
            // v.thickness.toString() === item.thickness
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
              // thickness: matchingVariation.thickness,
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
  

  // createCustomOrderByName: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   try {
  //     const { userName, products, paymentType } = req.body;
  //     let paidAmt: number = Number(req.body.paidAmount) || 0;
  
  //     // Validate inputs
  //     if (!userName || !Array.isArray(products) || products.length === 0) {
  //       res.status(400).json({ message: "User name and product list are required." });
  //       return;
  //     }
  
  //     // Find user by name
  //     const user = await UserModel.findOne({ username: userName });
  //     if (!user) {
  //       res.status(404).json({ message: "User not found." });
  //       return;
  //     }
  
  //     const userId = user._id;
  
  //     let totalAmount = 0;
  //     let validatedItems = [];
      
  //     // Validate each product and calculate total amount using product price from variations
  //     for (const item of products) {
  //       const product = await ProductModel.findById(item.productId)
  //         .populate("variations.color")
  //         .populate("variations.size");
  
  //       if (!product) {
  //         res.status(404).json({ message: `Product with ID ${item.productId} not found.` });
  //         return;
  //       }
  
  //       // Filter out inactive variations (color and size should be active)
  //       const activeVariations = product.variations.filter((v: any) =>
  //         v.color.active && v.size.active
  //       );
  
  //       // If no active variations are found
  //       if (activeVariations.length === 0) {
  //         res.status(400).json({
  //           message: `No active variations found for product ${product.name}.`
  //         });
  //         return;
  //       }
  
  //       // Find the variation based on color and size
  //       const variation = activeVariations.find((v) =>
  //         v.color._id.toString() === item.color.toString() &&
  //         v.size._id.toString() === item.size.toString()
  //       );
  
  //       // If no matching variation is found, return the error with available variations
  //       if (!variation) {
  //         res.status(400).json({
  //           message: `No matching variation found for product ${product.name}.`,
  //           availableVariations: activeVariations.map(async v => ({
  //             color: v.color._id,
  //             colorName: (await ColorModel.findById(v.color))?.colorName,
  //             size: v.size._id,
  //             sizeName: v.size,
  //             price: v.price
  //           }))
  //         });
  //         return;
  //       }
  
  //       // Calculate the total amount using the variation price
  //       totalAmount += variation.price * item.quantity;
        
  //       // Format the item according to the schema
  //       validatedItems.push({
  //         productId: item.productId,
  //         quantity: item.quantity,
  //         variation: {
  //           color: item.color,
  //           size: item.size
  //         }
  //       });
  //     }
  
  //     // Calculate payment details
  //     let dueAmount = totalAmount - paidAmt;
  //     let paymentStatus: "Pending" | "Partial" | "Paid" = "Pending";
  
  //     if (paymentType === "full") {
  //       dueAmount = 0;
  //       paymentStatus = "Paid";
  //     } else if (paymentType === "partial") {
  //       paymentStatus = dueAmount > 0 ? "Partial" : "Paid";
  //     } else if (paymentType === "cod") {
  //       dueAmount = totalAmount;
  //       paidAmt = 0;
  //       paymentStatus = "Pending";
  //     }
  
  //     // Fallback values for contact details if not provided
  //     const contactName = req.body.contactName || user.username || userName;
  //     const contactNumber = req.body.contactNumber || user.phoneNumber || "0000000000";
  //     const deliverTo = req.body.deliverTo || "Default Address";
  //     const receiptUrls: string[] = [];
  
  //     // Create the order with properly structured items
  //     const newOrder = new OrderModel({
  //       userId,
  //       items: validatedItems,
  //       contactName,
  //       contactNumber,
  //       deliverTo,
  //       totalAmount,
  //       paidAmount: paidAmt,
  //       dueAmount,
  //       paymentType,
  //       paymentStatus,
  //       receiptUrls,
  //       receipts: [],
  //       orderStatus: "custom", // Set as custom order
  //     });
  
  //     await newOrder.save();
  
  //     // Populate order details for notification
  //     const populatedOrder = await OrderModel.findById(newOrder._id)
  //       .populate('userId', 'username email phoneNumber')
  //       .populate({
  //         path: 'items.productId',
  //         select: 'name images'
  //       })
  //       .populate({
  //         path: 'items.variation.color',
  //         select: 'name code'
  //       })
  //       .populate({
  //         path: 'items.variation.size',
  //         select: 'name value'
  //       });
  
  //     // Emit a notification to the user
  //     io.emit(`user-${userId}`, {
  //       type: 'new-custom-order',
  //       message: `Admin has created a custom order for you. Order ID: ${newOrder._id}. Please proceed to payment.`,
  //       order: populatedOrder
  //     });
  
  //     // Also emit to a general channel for admin dashboard
  //     io.emit('new-order', {
  //       message: `New custom order created for user: ${userName}`,
  //       order: populatedOrder
  //     });
  
  //     res.status(201).json({
  //       message: "Custom order created successfully.",
  //       orderId: newOrder._id,
  //       totalAmount,
  //       paidAmount: paidAmt,
  //       dueAmount,
  //       user: {
  //         id: user._id,
  //         username: user.username,
  //         email: user.email,
  //         phoneNumber: user.phoneNumber
  //       },
  //       orderDetails: populatedOrder
  //     });
  //   } catch (error) {
  //     console.error("Error creating custom order:", error);
  //     res.status(500).json({ 
  //       message: "Failed to create custom order", 
  //       error: error instanceof Error ? error.message : "Unknown error" 
  //     });
  //   }
  // },
  
  createCustomOrderByName: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userName, products, paymentType } = req.body;
      let paidAmt: number = Number(req.body.paidAmount) || 0;
  
      // Sanitize inputs
      const sanitizedUserName = userName ? String(userName).trim() : '';
  
      // Validate required inputs
      if (!sanitizedUserName) {
        res.status(400).json({ message: "User name is required." });
        return;
      }
  
      if (!Array.isArray(products) || products.length === 0) {
        res.status(400).json({ message: "Product list is required and must be a non-empty array." });
        return;
      }
  
      if (!['full', 'partial', 'cod'].includes(paymentType)) {
        res.status(400).json({ message: "Invalid payment type. Must be 'full', 'partial', or 'cod'." });
        return;
      }
  
      if (isNaN(paidAmt) || paidAmt < 0) {
        res.status(400).json({ message: "Paid amount must be a non-negative number." });
        return;
      }
  
      // Find user by name
      const user = await UserModel.findOne({ username: sanitizedUserName });
      if (!user) {
        res.status(404).json({ message: "User not found." });
        return;
      }
  
      const userId = user._id;
  
      // Validate products and calculate total amount
      // const session = await mongoose.startSession();
      // session.startTransaction();
      const productsValidation = await validateProducts(products);
    if (!productsValidation.isValid) {
      res.status(400).json({
        message: productsValidation.message,
        details: productsValidation.data
      });
      return;
    }
  
      const { validatedItems, totalAmount } = productsValidation.data;
  
      // Calculate payment details
      const paymentDetails = calculatePaymentDetails(totalAmount, paidAmt, paymentType);
  
      // Fallback values for contact details if not provided
      const contactName = req.body.contactName || user.username || sanitizedUserName;
      const contactNumber = req.body.contactNumber || user.phoneNumber || "0000000000";
      const deliverTo = req.body.deliverTo || "Default Address";
  
      // Create the order with properly structured items
      const newOrder = new OrderModel({
        userId,
        items: validatedItems,
        contactName,
        contactNumber,
        deliverTo,
        totalAmount,
        paidAmount: paymentDetails.paidAmount,
        dueAmount: paymentDetails.dueAmount,
        paymentType,
        paymentStatus: paymentDetails.paymentStatus,
        receiptUrls: [],
        receipts: [],
        orderStatus: "custom", // Set as custom order
      });
  
      await newOrder.save();
  
      // Populate order details for notification
      const populatedOrder = await OrderModel.findById(newOrder._id)
        .populate('userId', 'username email phoneNumber')
        .populate({
          path: 'items.productId',
          select: 'name images'
        })
        .populate({
          path: 'items.variation.color',
          select: 'name code'
        })
        .populate({
          path: 'items.variation.size',
          select: 'name value'
        });

      // Emit notifications
      io.emit(`user-${userId}`, {
        type: 'new-custom-order',
        message: `Admin has created a custom order for you. Order ID: ${newOrder._id}. Please proceed to payment.`,
        order: populatedOrder
    });
      // Send successful response
      res.status(201).json({
        message: "Custom order created successfully.",
        orderId: newOrder._id,
        totalAmount,
        paidAmount: paymentDetails.paidAmount,
        dueAmount: paymentDetails.dueAmount,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber
        },
        orderDetails: newOrder
      });
  
    } catch (error) {
      // Handle error
      console.error("Error creating custom order:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Failed to create custom order", error: errorMessage });
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

  // getOrderRequest: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   try {
  //     // Filter for orders with 'pending' order status
  //     const filter: any = { orderStatus: "pending" };
  
  //     // Fetch orders with user and product details populated
  //     const orders = await OrderModel.find(filter)
  //       .populate("items.productId")  // Populate product details
  //       .populate("userId", "username email phone")  // Populate user details
  //       .lean();
  
  //     console.log("🔹 Pending Orders Found:", orders.length);
  
  //     // If no pending orders are found, return a 404 response
  //     if (orders.length === 0) {
  //        res.status(404).json({ message: "No pending orders found." });
  //        return
  //     }
  
  //     // Return the pending orders along with the total count of pending orders
  //     res.status(200).json({
  //       totalCount: orders.length,
  //       orders
  //     });
  //   } catch (error) {
  //     console.error("Error Fetching 'pending' Orders:", error);
  //     next(error);
  //   }
  // },
  

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
            orderStatus: { $in: ["cancelled", "pending", "custom", "partial", "complete"] }, // Filter for relevant statuses
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
        res.status(200).json({
          order});
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

