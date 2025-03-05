import { Request, Response, NextFunction } from "express";
import ManualOrderModel from "../../models/manualOrderModel";

// ✅ Add a Manual Order
export const addManualOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderNo, date, customerName, amount } = req.body;

    if (!orderNo || !date || !customerName || !amount) {
       res.status(400).json({ message: "All fields are required: orderNo, date, customerName, amount." });
       return;
    }

    // ✅ Create new manual order
    const newOrder = new ManualOrderModel({
      orderNo,
      date: new Date(date),
      customerName,
      amount,
    });

    await newOrder.save();

    res.status(201).json({ message: "Manual order added successfully.", order: newOrder });
  } catch (error) {
    next(error);
  }
};

export const getManualOrdersSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // ✅ Count total manual orders
      const totalOrders = await ManualOrderModel.countDocuments();
      const Details = await ManualOrderModel.find();
  
      // ✅ Aggregate total amount from all manual orders
      const totalAmountAgg = await ManualOrderModel.aggregate([
        { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
      ]);
  
      // ✅ Extract total amount (default to 0 if no data)
      const totalAmount = totalAmountAgg.length > 0 ? totalAmountAgg[0].totalAmount : 0;
  
      res.status(200).json({
        totalOrders,
        totalAmount,
        Details,
      });
    } catch (error) {
      next(error);
    }};
