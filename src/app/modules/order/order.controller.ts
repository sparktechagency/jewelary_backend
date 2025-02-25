
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

export const OrderController = {


  

// placeOrder: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   uploadOrder(req, res, async (err: any) => {
//     if (err) {
//       console.log("Multer Error:", err);
//       return res.status(400).json({ message: `Multer error: ${err.message}`, details: err });
//     }

//     console.log("Files:", req.files);
//     console.log("Body:", req.body);

//     try {
//       if (!req.user) {
//         return res.status(401).json({ message: "Unauthorized: User not found." });
//       }

//       let { contactName, contactNumber, deliverTo, paymentType, paidAmount } = req.body;
//       paidAmount = Number(paidAmount) || 0;

//       if (!contactName || !contactNumber || !deliverTo) {
//         return res.status(400).json({ message: "Missing required fields: contactName, contactNumber, deliverTo." });
//       }

//       const userId = (req.user as { id: string }).id;

//       let products;
//       try {
//         products = typeof req.body.products === "string" ? JSON.parse(req.body.products) : req.body.products;
//       } catch (e) {
//         return res.status(400).json({ message: "Invalid products format" });
//       }

//       if (!Array.isArray(products) || products.length === 0) {
//         return res.status(400).json({ message: "Product list is required." });
//       }

//       let totalAmount = 0;
//       const itemsWithDetails = [];

//       // Loop through each product item in the order
//       for (const item of products) {
//         // Expect each item to have: productId, color, size, thickness, and quantity
//         const product = await ProductModel.findById(item.productId);
//         if (!product) {
//           return res.status(404).json({ message: `Product with ID ${item.productId} not found.` });
//         }

//         // Validate that the selected attributes exist in the product
//         if (!product.colors.some((c: mongoose.Types.ObjectId) => c.toString() === item.color)) {
//           return res.status(400).json({ message: `Selected color ${item.color} is not available for product ${product.name}.` });
//         }
//         if (!product.sizes.some((s: mongoose.Types.ObjectId) => s.toString() === item.size)) {
//           return res.status(400).json({ message: `Selected size ${item.size} is not available for product ${product.name}.` });
//         }
//         if (!product.thicknesses.some((t: mongoose.Types.ObjectId) => t.toString() === item.thickness)) {
//           return res.status(400).json({ message: `Selected thickness ${item.thickness} is not available for product ${product.name}.` });
//         }

//         // Check that there is enough stock available for the product
//         if (product.availableQuantity < item.quantity) {
//           return res.status(400).json({
//             message: `Not enough stock for product ${product.name}. Available: ${product.availableQuantity}, Requested: ${item.quantity}`
//           });
//         }

//         // Update total amount based on the product price and quantity
//         totalAmount += product.price * item.quantity;

//         // Deduct the ordered quantity from the product's available quantity
//         product.availableQuantity -= item.quantity;
//         await product.save();

//         // Prepare order item details
//         itemsWithDetails.push({
//           productId: item.productId,
//           quantity: item.quantity,
//           color: item.color,
//           size: item.size,
//           thickness: item.thickness,
//           price: product.price,
//         });
//       }

//       // Calculate payment status and due amount based on the provided paymentType
//       let dueAmount: number = totalAmount - paidAmount;
//       let paymentStatus: "Pending" | "Partial" | "Paid" = "Pending";

//       if (paymentType === "full") {
//         dueAmount = 0;
//         paymentStatus = "Paid";
//       } else if (paymentType === "partial") {
//         paymentStatus = dueAmount > 0 ? "Partial" : "Paid";
//       } else if (paymentType === "cod") {
//         dueAmount = totalAmount;
//         paidAmount = 0;
//         paymentStatus = "Pending";
//       }

//       // Extract uploaded receipt file paths if any
//       let receiptUrls: string[] = [];
//       if (req.files && (req.files as any)["receipts"]) {
//         receiptUrls = (req.files as any)["receipts"].map((file: Express.Multer.File) => `/uploads/receipts/${file.filename}`);
//       }

//       // Create the new order document
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
//         orderStatus: "pending",
//       });

//       await newOrder.save();

//       return res.status(201).json({
//         message: "Order placed successfully. Proceed to payment.",
//         orderId: newOrder._id,
//         paymentType,
//         totalAmount,
//         paidAmount,
//         dueAmount,
//         receiptUrls,
//         items: itemsWithDetails,
//       });
//     } catch (error) {
//       console.error("Order processing error:", error);
//       next(error);
//     }
//   });
// },


  // createCustomOrderByName: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   try {
  //     const { userName, products, paymentType, paidAmount } = req.body;
  
  //     // Validate inputs
  //     if (!userName || !Array.isArray(products) || products.length === 0) {
  //        res.status(400).json({ message: "User name and product list are required." });
  //     }
  
  //     // Find user by name
  //     const user = await UserModel.findOne({ username: userName });
  //     if (!user) {
  //        res.status(404).json({ message: "User not found." });
  //     }
  
  //     // Get the user ID
  //     if (!user) {
  //       res.status(404).json({ message: "User not found." });
  //       return;
  //     }
  //     const userId = user._id as mongoose.Types.ObjectId;
  
  //     let totalAmount = 0;
  //     // Validate each product
  //     for (const item of products) {
  //       const product = await ProductModel.findById(item.productId);
  //       if (!product) {
  //          res.status(404).json({ message: `Product with ID ${item.productId} not found.` });
  //         return;
  //         }
        
  //       // Handle missing variations
  //       if (!product.variations || product.variations.length === 0) {
  //          res.status(400).json({ message: `Product with ID ${item.productId} has no variations. Please ensure variations are set.` });
  //         return;
  //         }
        
  //       // Calculate the total amount using the first variation
  //       const variation = product.variations[0];
  //       if (!variation.price) {
  //         res.status(400).json({ message: `Product with ID ${item.productId} has no price in its variations.` });
  //      return;
  //       }
        
  //       // Calculate total amount
  //       totalAmount += variation.price * item.quantity;
        
        
  //       // Calculate the total amount
  //       totalAmount += variation.price * item.quantity;
        

  //     }
  
  //     let dueAmount = totalAmount - (paidAmount || 0);
  //     let paidAmounts: number = Number(req.body.paidAmount) || 0;
      
  //     let paymentStatus: "Pending" | "Partial" | "Paid" = "Pending";
  
  //     if (paymentType === "full") {
  //       dueAmount = 0;
  //       paymentStatus = "Paid";
  //     } else if (paymentType === "partial") {
  //       paymentStatus = dueAmount > 0 ? "Partial" : "Paid";
  //     } else if (paymentType === "cod") {
  //       dueAmount = totalAmount;
  //       paidAmounts = 0;
  //       paymentStatus = "Pending";
  //     }
  
  //     // Define missing variables
  //     const contactName = req.body.contactName || "Default Contact Name";
  //     const contactNumber = req.body.contactNumber || "0000000000";
  //     const deliverTo = req.body.deliverTo || "Default Address";
  //     const receiptUrls: string[] = [];

  //     // Create the order
  //     const newOrder = new OrderModel({
  //       userId,
  //       items: products.map((item: any) => ({
  //         productId: item.productId,
  //         quantity: item.quantity,
  //       })),
  //       contactName,
  //       contactNumber,
  //       deliverTo,
  //       totalAmount,
  //       paidAmount,
  //       dueAmount,
  //       paymentStatus,
  //       receiptUrls,
  //       orderStatus: "pending",
  //     });
  
  //     await newOrder.save();
  
  //     // Optionally, emit notification to user (e.g., using Socket.io or a different notification method)
  //     io.emit("orderStatusUpdate", {
  //       message: `Admin has created a custom order for you. Order ID: ${newOrder._id}. Please proceed to payment.`,
  //       orderId: newOrder._id,
  //     });
  
  //     res.status(201).json({
  //       message: "Custom order created successfully.",
  //       orderId: newOrder._id,
  //       totalAmount,
  //       paidAmount,
  //       dueAmount,
  //     });
  //   } catch (error) {
  //     console.error("Error creating custom order:", error);
  //     next(error);
  //   }
  // },

  // placeOrder: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   // Call the multer middleware to handle file uploads first
  //   uploadOrder(req, res, async (err: any) => {
  //     if (err) {
  //       console.log("Multer Error:", err);
  //       return res.status(400).json({ message: `Multer error: ${err.message}`, details: err });
  //     }
      
  //     console.log("Files:", req.files);
  //     console.log("Body:", req.body);
      
  //     try {
  //       // Ensure the user is authenticated
  //       if (!req.user) {
  //         return res.status(401).json({ message: "Unauthorized: User not found." });
  //       }
  
  //       // Destructure required fields from the request body
  //       let { contactName, contactNumber, deliverTo, paymentType, paidAmount } = req.body;
  //       paidAmount = Number(paidAmount) || 0;
  
  //       if (!contactName || !contactNumber || !deliverTo) {
  //         return res.status(400).json({ message: "Missing required fields: contactName, contactNumber, deliverTo." });
  //       }
  
  //       const userId = (req.user as { id: string }).id;
  
  //       // Parse the products field; expect a JSON string representing an array
  //       let products;
  //       try {
  //         products = typeof req.body.products === "string" ? JSON.parse(req.body.products) : req.body.products;
  //       } catch (e) {
  //         return res.status(400).json({ message: "Invalid products format" });
  //       }
  
  //       if (!Array.isArray(products) || products.length === 0) {
  //         return res.status(400).json({ message: "Product list is required." });
  //       }
  
  //       let totalAmount = 0;
  //       const itemsWithDetails: any[] = [];
  
  //       // Process each product item in the order
  //       for (const item of products) {
  //         // Each item must include: productId, color, size, thickness, and quantity
  //         const product = await ProductModel.findById(item.productId);
  //         if (!product) {
  //           return res.status(404).json({ message: `Product with ID ${item.productId} not found.` });
  //         }
  
  //         // Validate that the selected attributes exist in the product
  //         if (!product.colors.some((c: mongoose.Types.ObjectId) => c.toString() === item.color)) {
  //           return res.status(400).json({ message: `Selected color ${item.color} is not available for product ${product.name}.` });
  //         }
  //         if (!product.sizes.some((s: mongoose.Types.ObjectId) => s.toString() === item.size)) {
  //           return res.status(400).json({ message: `Selected size ${item.size} is not available for product ${product.name}.` });
  //         }
  //         if (!product.thicknesses.some((t: mongoose.Types.ObjectId) => t.toString() === item.thickness)) {
  //           return res.status(400).json({ message: `Selected thickness ${item.thickness} is not available for product ${product.name}.` });
  //         }
  
  //         // Ensure enough stock is available
  //         if (product.availableQuantity < item.quantity) {
  //           return res.status(400).json({
  //             message: `Not enough stock for product ${product.name}. Available: ${product.availableQuantity}, Requested: ${item.quantity}`
  //           });
  //         }
  
  //         // Update total amount and reduce stock
  //         totalAmount += product.price * item.quantity;
  //         product.availableQuantity -= item.quantity;
  //         await product.save();
  
  //         // Build the order item details
  //         itemsWithDetails.push({
  //           productId: item.productId,
  //           quantity: item.quantity,
  //           color: item.color,
  //           size: item.size,
  //           thickness: item.thickness,
  //           price: product.price,
  //         });
  //       }
  
  //       // Calculate payment status and due amount based on paymentType
  //       let dueAmount: number = totalAmount - paidAmount;
  //       let paymentStatus: "Pending" | "Partial" | "Paid" = "Pending";
  
  //       if (paymentType === "full") {
  //         dueAmount = 0;
  //         paymentStatus = "Paid";
  //       } else if (paymentType === "partial") {
  //         paymentStatus = dueAmount > 0 ? "Partial" : "Paid";
  //       } else if (paymentType === "cod") {
  //         dueAmount = totalAmount;
  //         paidAmount = 0;
  //         paymentStatus = "Pending";
  //       }
  
  //       // Extract receipt file URLs (if any files were uploaded under key "receipts")
  //       let receiptUrls: string[] = [];
  //       if (req.files && (req.files as any)["receipts"]) {
  //         receiptUrls = (req.files as any)["receipts"].map((file: Express.Multer.File) => `/uploads/receipts/${file.filename}`);
  //       }
  
  //       // Create the order document
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
  //         orderStatus: "pending",
  //       });
  
  //       await newOrder.save();
  
  //       return res.status(201).json({
  //         message: "Order placed successfully. Proceed to payment.",
  //         orderId: newOrder._id,
  //         paymentType,
  //         totalAmount,
  //         paidAmount,
  //         dueAmount,
  //         receiptUrls,
  //         items: itemsWithDetails,
  //       });
  //     } catch (error) {
  //       console.error("Order processing error:", error);
  //       next(error);
  //     }
  //   });
  // },

  placeOrder: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Use the multer middleware to handle file uploads first
    uploadOrder(req, res, async (err: any) => {
      if (err) {
        console.log("Multer Error:", err);
        return res.status(400).json({ message: `Multer error: ${err.message}`, details: err });
      }
      
      console.log("Files:", req.files);
      console.log("Body:", req.body);
      
      try {
        // Ensure the user is authenticated
        if (!req.user) {
          return res.status(401).json({ message: "Unauthorized: User not found." });
        }
  
        // Destructure required fields from the request body
        let { contactName, contactNumber, deliverTo, paymentType, paidAmount } = req.body;
        paidAmount = Number(paidAmount) || 0;
  
        if (!contactName || !contactNumber || !deliverTo) {
          return res.status(400).json({ message: "Missing required fields: contactName, contactNumber, deliverTo." });
        }
  
        const userId = (req.user as { id: string }).id;
  
        // Parse the products field; expect a JSON string representing an array
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
  
        // Process each product item in the order
       // Process each product item in the order
for (const item of products) {
  // Each item must include: productId, color, size, thickness, and quantity
  const product = await ProductModel.findById(item.productId);
  if (!product) {
    return res.status(404).json({ message: `Product with ID ${item.productId} not found.` });
  }

  // Instead of using product.colors, product.sizes, etc.,
  // check if the product has a variation that matches the requested attributes.
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

  // Check that there is enough stock available.
  // (Assuming product.availableQuantity reflects overall stock)
  if (product.availableQuantity < item.quantity) {
    return res.status(400).json({
      message: `Not enough stock for product ${product.name}. Available: ${product.availableQuantity}, Requested: ${item.quantity}`
    });
  }

  // Update total amount and reduce stock (using product.price or matchingVariation.price)

  totalAmount += product.deliveryCharge + matchingVariation.price * item.quantity;
  product.availableQuantity -= item.quantity;
  await product.save();

  // Build the order item details including full variation details:
  itemsWithDetails.push({
    productId: item.productId,
    quantity: item.quantity,
    variation: {
      color: matchingVariation.color, // This will be the ObjectId; if you want details, populate later or fetch from ColorModel
      size: matchingVariation.size,
      thickness: matchingVariation.thickness,
      price: matchingVariation.price,
    }
  });
}

  
        // Calculate payment status and due amount based on paymentType
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
  
        // Extract receipt file URLs (if any files were uploaded under key "receipts")
        let receiptUrls: string[] = [];
        if (req.files && (req.files as any)["receipts"]) {
          receiptUrls = (req.files as any)["receipts"].map((file: Express.Multer.File) => `/uploads/receipts/${file.filename}`);
        }
  
        // Create the order document (make sure your Order schema is updated to store objects for color, size, thickness)
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
  //        res.status(400).json({ message: "User name and product list are required." });
  //        return
  //     }
  
  //     // Find user by name
  //     const user = await UserModel.findOne({ username: userName });
  //     if (!user) {
  //        res.status(404).json({ message: "User not found." });
  //        return
  //     }
  
  //     const userId = user._id as mongoose.Types.ObjectId;
  
  //     let totalAmount = 0;
  //     // Validate each product and calculate total amount using product price
  //     for (const item of products) {
  //       const product = await ProductModel.findById(item.productId);
  //       if (!product) {
  //          res.status(404).json({ message: `Product with ID ${item.productId} not found.` });
  //          return
  //       }
  
  //       if (typeof product.price !== "number" || product.price <= 0) {
  //          res.status(400).json({ message: `Product with ID ${item.productId} has an invalid price.` });
  //          return
  //       }
  
  //       totalAmount += product.price * item.quantity;
  //     }
  
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
  //     const contactName = req.body.contactName || "Default Contact Name";
  //     const contactNumber = req.body.contactNumber || "0000000000";
  //     const deliverTo = req.body.deliverTo || "Default Address";
  //     const receiptUrls: string[] = [];
  
  //     // Create the order with items containing just productId and quantity
  //     const newOrder = new OrderModel({
  //       userId,
  //       items: products.map((item: any) => ({
  //         productId: item.productId,
  //         quantity: item.quantity,
  //       })),
  //       contactName,
  //       contactNumber,
  //       deliverTo,
  //       totalAmount,
  //       paidAmount: paidAmt,
  //       dueAmount,
  //       paymentType,
  //       paymentStatus,
  //       receiptUrls,
  //       orderStatus: "pending",
  //     });
  
  //     await newOrder.save();
  
  //     // Optionally emit a notification to the user
  //     io.emit("orderStatusUpdate", {
  //       message: `Admin has created a custom order for you. Order ID: ${newOrder._id}. Please proceed to payment.`,
  //       orderId: newOrder._id,
  //     });
  
  //      res.status(201).json({
  //       message: "Custom order created successfully.",
  //       orderId: newOrder._id,
  //       totalAmount,
  //       paidAmount: paidAmt,
  //       dueAmount,
  //     });
  //   } catch (error) {
  //     console.error("Error creating custom order:", error);
  //     next(error);
  //   }
  // },
  


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

  // updateOrderStatus: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   try {
  //     const { orderId, status } = req.body;
  //     console.log("🔍 Updating Order:", { orderId, status });
  //     if (!mongoose.Types.ObjectId.isValid(orderId)) {
  //       res.status(400).json({ message: "Invalid order ID format." });
  //       return;
  //     }
  //     const validStatuses = ["pending", "running", "completed", "custom", "cancelled"];
      
  //     if (!validStatuses.includes(status)) {
  //       res.status(400).json({ message: "Invalid order status." });
  //       return;
  //     }
  //     const order = await OrderModel.findById(orderId).populate("items.productId");
  //     if (!order) {
  //       console.error("Order Not Found");
  //       res.status(404).json({ message: "Order not found." });
  //       return;
  //     }
  //     // If order is accepted, update product quantities
  //     if (status === "accepted") {
  //       for (const item of order.items) {
  //         const product = await ProductModel.findById(item.productId);
  //         if (product) {
  //           if (product.availableQuantity >= item.quantity) {
  //             product.availableQuantity -= item.quantity;
  //             await product.save();
  //           } else {
  //             res.status(400).json({ message: `Not enough stock for product: ${product.name}` });
  //             return;
  //           }
  //         }
  //       }
  //     }
  //     order.orderStatus = status;
  //     await order.save();
  //     //emit a socket
  //     io.to(order.userId.toString()).emit("orderStatusUpdate", {
  //       orderId: order._id,
  //       orderStatus,
  //       fileName: order.receiptUrls && order.receiptUrls.length > 0 ? order.receiptUrls[0] : "",
  //       message: `Your order has been ${orderStatus}.`
  //     });
      
  //     console.log("✅ Order Updated:", order);
  //     io.to(order.userId.toString()).emit("orderStatusUpdate", {
  //       message: `Your order status has been updated to ${status}.`,
  //       orderId: order._id,
  //       status,
  //     });
  //     res.status(200).json({ message: "Order status updated successfully.", order });
  //   } catch (error) {
  //     console.error("Error Updating Order:", error);
  //     next(error);
  //   }
  // },

  updateOrderStatus: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orderId = req.params.id;
      const { status } = req.body; // Assuming 'status' is passed in the request body
      
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
      }

      if (order.orderStatus === "cancelled" && status !== "cancelled") {
         res.status(400).json({
          message: "Order is cancelled. Cannot change to another status."
        });
      }

      // If the status is valid, update the order status
      order.orderStatus = status;
      await order.save();

      // Emit a socket event to the user's room (using receiptUrls for fileName if available)
      io.to(order.userId.toString()).emit("orderStatusUpdate", {
        orderId: order._id,
        orderStatus: status,
        fileName: order.receiptUrls && order.receiptUrls.length > 0 ? order.receiptUrls[0] : "",
        message: `Your order has been ${status}.`
      });

      res.status(200).json({ message: "Order status updated successfully.", order });
    } catch (error) {
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

