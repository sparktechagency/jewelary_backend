import { Request, Response, NextFunction } from "express";
import OrderModel from "../../models/order.model";

export const getMyOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Ensure req.user is defined
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized. User not found." });
      return;
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
      return;
    }

    // Fetch orders and populate product details
    const orders = await OrderModel.find(filter).populate("items.productId");

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    next(error);
  }
};
