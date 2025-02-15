import { Request, Response, NextFunction } from "express";
import OrderModel from "../../models/order.model";

export const getOrdersByStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { status } = req.params;

        if (!["pending", "running", "completed", "custom", "cancelled"].includes(status)) {
            res.status(400).json({ message: "Invalid order status" });
            return;
        }

        const orders = await OrderModel.find({ orderStatus: status });

        if (orders.length === 0) {
            res.status(404).json({ message: "No orders found with this status" });
            return;
        }

        res.status(200).json({ orders });
    } catch (error) {
        next(error); // Properly passing error to Express error handler
    }
};
