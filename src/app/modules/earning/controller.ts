import { Request, Response, NextFunction } from "express";
import PaymentModel from "../../models/payment.model";
import OrderModel from "../../models/order.model";
import moment from "moment";

export const EarningsController = {
  // 🟢 Total Earnings
  getTotalEarnings: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const totalEarnings = await PaymentModel.aggregate([
        { $match: { status: "succeeded" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      res.status(200).json({ totalEarnings: totalEarnings[0]?.total || 0 });
    } catch (error) {
      next(error);
    }
  },

  // 🟢 Monthly Earnings
  getMonthlyEarnings: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const startOfMonth = moment().startOf("month").toDate();
      const monthlyEarnings = await PaymentModel.aggregate([
        { $match: { status: "succeeded", createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      res.status(200).json({ monthlyEarnings: monthlyEarnings[0]?.total || 0 });
    } catch (error) {
      next(error);
    }
  },

  // 🟢 Yearly Earnings
  getYearlyEarnings: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const startOfYear = moment().startOf("year").toDate();
      const yearlyEarnings = await PaymentModel.aggregate([
        { $match: { status: "succeeded", createdAt: { $gte: startOfYear } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      res.status(200).json({ yearlyEarnings: yearlyEarnings[0]?.total || 0 });
    } catch (error) {
      next(error);
    }
  },

  // 🟢 Pending Payments
  getPendingPayments: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pendingPayments = await OrderModel.aggregate([
        { $match: { paymentStatus: { $ne: "Paid" } } },
        { $group: { _id: null, total: { $sum: "$dueAmount" } } },
      ]);
      res.status(200).json({ pendingPayments: pendingPayments[0]?.total || 0 });
    } catch (error) {
      next(error);
    }
  },

  // 🟢 Manual Payment Entries
  getManualEntries: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const manualPayments = await PaymentModel.aggregate([
        { $match: { paymentType: "manual" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      res.status(200).json({ manualPayments: manualPayments[0]?.total || 0 });
    } catch (error) {
      next(error);
    }
  },

  // 🟢 Today’s Earnings
  getTodayEarnings: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const startOfToday = moment().startOf("day").toDate();
      const todayEarnings = await PaymentModel.aggregate([
        { $match: { status: "succeeded", createdAt: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      res.status(200).json({ todayEarnings: todayEarnings[0]?.total || 0 });
    } catch (error) {
      next(error);
    }
  },
};
