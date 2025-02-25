import { Request, Response, NextFunction } from "express";
import PaymentModel from "../../models/payment.model";
import OrderModel from "../../models/order.model";
import UserModel from "../../models/user.model";  // Import UserModel for calculating total users
import moment from "moment";

export const EarningsController = {
  // 🟢 Earnings Dashboard
  getEarningsDashboard: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Define date boundaries for the aggregations
      const startOfMonth = moment().startOf("month").toDate();
      const startOfYear = moment().startOf("year").toDate();
      const startOfToday = moment().startOf("day").toDate();

      // Run all aggregations concurrently using Promise.all
      const [
        totalEarningsAgg,
        monthlyEarningsAgg,
        yearlyEarningsAgg,
        todayEarningsAgg,
        pendingPaymentsAgg,
        manualPaymentsAgg,
        totalSalesAgg,
        totalProfitAgg,
        totalUsersAgg
      ] = await Promise.all([
        // Total Earnings: sum of all succeeded payment amounts
        PaymentModel.aggregate([
          { $match: { status: "succeeded" } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),
        // Monthly Earnings: succeeded payments from the start of this month
        PaymentModel.aggregate([
          { $match: { status: "succeeded", createdAt: { $gte: startOfMonth } } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),
        // Yearly Earnings: succeeded payments from the start of this year
        PaymentModel.aggregate([
          { $match: { status: "succeeded", createdAt: { $gte: startOfYear } } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),
        // Today’s Earnings: succeeded payments from the start of today
        PaymentModel.aggregate([
          { $match: { status: "succeeded", createdAt: { $gte: startOfToday } } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),
        // Pending Payments: orders where paymentStatus is not "Paid"
        OrderModel.aggregate([
          { $match: { paymentStatus: { $ne: "Paid" } } },
          { $group: { _id: null, total: { $sum: "$dueAmount" } } }
        ]),
        // Manual Payment Entries: sum of amounts with paymentType "manual"
        PaymentModel.aggregate([
          { $match: { paymentType: "manual" } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),
        // Total Sales: sum of all totalAmount fields in the orders
        OrderModel.aggregate([
          { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } }
        ]),
        // Total Profit: totalSales - totalPaidAmount
        OrderModel.aggregate([
          { $group: { _id: null, totalSales: { $sum: "$totalAmount" }, totalPaid: { $sum: "$paidAmount" } } },
          { $project: { profit: { $subtract: ["$totalSales", "$totalPaid"] } } }
        ]),
        // Total Users: count of all users
        UserModel.aggregate([
          { $count: "totalUsers" }
        ])
      ]);

      // Extract totals from each aggregation (or default to 0 if none found)
      const totalEarnings = totalEarningsAgg[0]?.total || 0;
      const monthlyEarnings = monthlyEarningsAgg[0]?.total || 0;
      const yearlyEarnings = yearlyEarningsAgg[0]?.total || 0;
      const todayEarnings = todayEarningsAgg[0]?.total || 0;
      const pendingPayments = pendingPaymentsAgg[0]?.total || 0;
      const manualPayments = manualPaymentsAgg[0]?.total || 0;
      const totalSales = totalSalesAgg[0]?.totalSales || 0;
      const totalProfit = totalProfitAgg[0]?.profit || 0;
      const totalUsers = totalUsersAgg[0]?.totalUsers || 0;

      // Return a single JSON response with all the aggregated earnings data
      res.status(200).json({
        totalEarnings,
        monthlyEarnings,
        yearlyEarnings,
        todayEarnings,
        pendingPayments,
        manualPayments,
        totalSales,
        totalProfit,
        totalUsers
      });
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
