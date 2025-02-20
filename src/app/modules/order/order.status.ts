import { Request, Response, NextFunction } from "express";
import OrderModel from "../../models/order.model";
import { AuthRequest } from "../../../types/express";

// export const getMyOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   try {
//     // Ensure req.user is defined
//     if (!req.user) {
//       res.status(401).json({ message: "Unauthorized. User not found." });
//       return;
//     }

//     const { status } = req.query;
    
//     // Base filter to match user's orders
//     const filter: any = { userId: req.user.id };

//     // Validate and apply status filter if provided
//     const allowedStatuses = ["pending", "running", "completed", "custom", "cancelled"];
//     if (status && allowedStatuses.includes(status as string)) {
//       filter.orderStatus = status;
//     } else if (status) {
//       res.status(400).json({ message: "Invalid order status" });
//       return;
//     }

//     // Fetch orders and populate product details
//     const orders = await OrderModel.find(filter).populate("items.productId");

//     res.status(200).json({ orders });
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     next(error);
//   }
// };


// export const getMyOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   try {
//     // Ensure req.user is defined
//     if (!req.user) {
//        res.status(401).json({ message: "Unauthorized. User not found." });
//        return
//     }

//     const { status } = req.query;

//     // Base filter to match user's orders
//     const filter: any = { userId: req.user.id };

//     // Validate and apply status filter if provided
//     const allowedStatuses = ["pending", "running", "completed", "custom", "cancelled"];
//     if (status && allowedStatuses.includes(status as string)) {
//       filter.orderStatus = status;
//     } else if (status) {
//        res.status(400).json({ message: "Invalid order status" });
//        return
//     }

//     // Fetch orders and populate product details along with variations
//     const orders = await OrderModel.find(filter)
//       .populate({
//         path: 'items.productId', // Populate product details
//         populate: {
//           path: 'variations', // Populate the variations of the product
//           model: 'ProductVariation', // Make sure you're referencing the correct model for variations
//         }
//       })
//       .lean();  // Convert to plain JavaScript objects for easier manipulation

//     res.status(200).json({ orders });
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     next(error);
//   }
// };




export const getMyOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Ensure req.user is defined
    if (!req.user) {
       res.status(401).json({ message: "Unauthorized. User not found." });
       return
    }

    const { status } = req.query;

    // Base filter to match user's orders
    const filter: any = { userId: req.user.id };

    // Validate and apply status filter if provided
    const allowedStatuses = ["pending", "running", "completed", "custom", "cancelled"];
    if (status && allowedStatuses.includes(status as string)) {
      filter.orderStatus = status;
    } else if (status) {
       res.status(400).json({ message: "Invalid order status" });
       return
    }

    // Fetch orders and populate product details along with variations
    const orders = await OrderModel.find(filter)
      .populate({
        path: 'items.productId', // Populate product details
        populate: {
          path: 'variations', // Populate the variations of the product
          model: 'ProductVariation', // Make sure you're referencing the correct model for variations
        }
      })
      .lean();  // Convert to plain JavaScript objects for easier manipulation

    // Include the paymentType in the response
    const ordersWithPaymentType = orders.map(order => ({
      ...order,
      paymentType: order.paymentStatus === "Paid" ? "full" : order.paymentStatus === "Partial" ? "partial" : "cod",
    }));

    res.status(200).json({ orders: ordersWithPaymentType });
  } catch (error) {
    console.error("Error fetching orders:", error);
    next(error);
  }
};
