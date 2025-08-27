import { Request, Response, NextFunction } from "express";
import PaymentModel from "../../models/payment.model";
import OrderModel from "../../models/order.model";
import UserModel from "../../models/user.model";  // Import UserModel for calculating total users
import moment from "moment";
import { PipelineStage } from "mongoose";
import ManualOrderModel from "../../models/manualOrderModel";

const EarningsController = {

  getEarningsDashboard: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const startOfMonth = moment().startOf("month").toDate();
      const startOfYear = moment().startOf("year").toDate();
      const startOfToday = moment().startOf("day").toDate();

      // Fetch all aggregations in parallel
      const [
        totalEarningsAgg,
        manualTotalEarningsAgg,
        monthlyEarningsAgg,
        yearlyEarningsAgg,
        todayEarningsAgg,
        pendingPaymentsAgg,
        manualPaymentsAgg,
        totalSalesAgg,
        totalProfitAgg,
        totalUsersAgg,
        customOrdersAgg,
      ] = await Promise.all([

        // Total earnings including manual orders
        PaymentModel.aggregate([
          { $match: { status: "succeeded" } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),
        ManualOrderModel.aggregate([
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),
        //custom orders
        OrderModel.aggregate([
          { $match: { orderStatus: "custom" } },
          { $group: { _id: null, total: { $sum: 1 } } }

        ]),
        // Monthly earnings
        PaymentModel.aggregate([
          { $match: { status: "succeeded", createdAt: { $gte: startOfMonth } } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),

        // Yearly earnings
        PaymentModel.aggregate([
          { $match: { status: "succeeded", createdAt: { $gte: startOfYear } } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),

        // Today's earnings
        PaymentModel.aggregate([
          { $match: { status: "succeeded", createdAt: { $gte: startOfToday } } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),

        // Pending payments
        OrderModel.aggregate([
          { $match: { paymentStatus: { $ne: "Paid" } } },
          { $group: { _id: null, total: { $sum: "$dueAmount" } } }
        ]),

        // Manual payments
        PaymentModel.aggregate([
          { $match: { paymentType: "manual" } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),

        // Total sales
        OrderModel.aggregate([
          { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } }
        ]),

        // Total profit
        OrderModel.aggregate([
          { $group: { _id: null, totalSales: { $sum: "$totalAmount" }, totalPaid: { $sum: "$paidAmount" } } },
          { $project: { profit: { $subtract: ["$totalSales", "$totalPaid"] } } }
        ]),

        // Total users
        UserModel.aggregate([{ $count: "totalUsers" }])
      ]);

      // Access results with safe checks (use optional chaining)
      const totalEarnings = (totalEarningsAgg?.[0]?.total ?? 0) + (manualTotalEarningsAgg?.[0]?.total ?? 0);
      const monthlyEarnings = monthlyEarningsAgg?.[0]?.total ?? 0;
      const yearlyEarnings = yearlyEarningsAgg?.[0]?.total ?? 0;
      const todayEarnings = todayEarningsAgg?.[0]?.total ?? 0;
      const pendingPayments = pendingPaymentsAgg?.[0]?.total ?? 0;
      const manualPayments = manualPaymentsAgg?.[0]?.total ?? 0;
      const totalSales = totalSalesAgg?.[0]?.totalSales ?? 0;
      const totalProfit = totalProfitAgg?.[0]?.profit ?? 0;
      const totalUsers = totalUsersAgg?.[0]?.totalUsers ?? 0;
      const customOrders = customOrdersAgg?.[0]?.total ?? 0;


      // Return response
      res.status(200).json({
        totalEarnings,
        monthlyEarnings,
        customOrders,
        yearlyEarnings,
        todayEarnings,
        pendingPayments,
        manualPayments,
        totalSales,
        totalProfit,
        totalUsers,
      });
    } catch (error) {
      next(error);
    }
  },

  getEarningsDetails: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type } = req.params;
      const startOfMonth = moment().startOf("month").toDate();
      const startOfYear = moment().startOf("year").toDate();
      const startOfToday = moment().startOf("day").toDate();

      const [
        totalEarningsAgg,
        monthlyEarningsAgg,
        yearlyEarningsAgg,
        todayEarningsAgg,
        pendingPaymentsAgg,
        manualPaymentsAgg,
        customOrdersAgg,
      ] = await Promise.all([
        // Pending orders aggregation
        OrderModel.aggregate([
          { $match: { orderStatus: "pending" } },
          { $group: { _id: null, total: { $sum: 1 } } }
        ]),

        // Total earnings aggregation
        PaymentModel.aggregate([
          { $match: { status: { $in: ["Paid", "succeeded"] } } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),

        // Total earnings aggregation for "Paid" and "succeeded" payments
        PaymentModel.aggregate([
          { $match: { status: { $in: ["Paid", "succeeded"] } } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),

        // Yearly earnings aggregation
        PaymentModel.aggregate([
          { $match: { status: { $in: ["Paid", "succeeded"] }, createdAt: { $gte: startOfYear } } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),

        // Today's earnings aggregation
        PaymentModel.aggregate([
          { $match: { status: { $in: ["Paid", "succeeded"] }, createdAt: { $gte: startOfToday } } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),

        // Pending payments aggregation (orders that are not marked as "Paid")
        OrderModel.aggregate([
          { $match: { paymentStatus: { $ne: "Paid" } } },
          { $group: { _id: null, total: { $sum: "$dueAmount" } } }
        ]),

        // Manual payments aggregation
        PaymentModel.aggregate([
          { $match: { paymentType: "manual", status: { $in: ["Paid", "succeeded"] } } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ])
      ]);

      const totalEarnings = totalEarningsAgg?.[0]?.total ?? 0;
      const yearlyEarnings = yearlyEarningsAgg?.[0]?.total ?? 0;
      const todayEarnings = todayEarningsAgg?.[0]?.total ?? 0;
      const pendingPayments = pendingPaymentsAgg?.[0]?.total ?? 0;
      const manualPayments = manualPaymentsAgg?.[0]?.total ?? 0;
      const monthlyEarnings = monthlyEarningsAgg?.[0]?.total ?? 0;
      const customOrders = customOrdersAgg?.[0]?.total ?? 0;

      let transactions = [];

      // Determine filter and fetch transactions based on the earnings type (monthly, yearly, etc.)
      switch (type) {
        case "totalEarnings":
          transactions = await PaymentModel.find({ status: { $in: ["Paid", "succeeded"] } })
            .populate("userId", "username", UserModel)
            .populate({
              path: "orderId",
              populate: {
                path: "items.productId",
                select: "name file"
              }
            })
            .select("_id orderId amount userId")
            .lean();
          break;

        case "monthlyEarnings":
          transactions = await PaymentModel.find({ status: { $in: ["Paid", "succeeded"] }, createdAt: { $gte: startOfMonth } })
            .populate("userId", "username")
            .populate({
              path: "orderId",
              populate: {
                path: "items.productId",
                select: "name file"
              }
            })
            .select("_id orderId amount userId")
            .lean();
          break;

        case "yearlyEarnings":
          transactions = await PaymentModel.find({ status: { $in: ["Paid", "succeeded"] }, createdAt: { $gte: startOfYear } })
            .populate("userId", "username")
            .populate({
              path: "orderId",
              populate: {
                path: "items.productId",
                select: "name file"
              }
            })
            .select("_id orderId amount userId")
            .lean();
          break;

        case "todayEarnings":
          transactions = await PaymentModel.find({ status: { $in: ["Paid", "succeeded"] }, createdAt: { $gte: startOfToday } })
            .populate("userId", "username")
            .populate({
              path: "orderId",
              populate: {
                path: "items.productId",
                select: "name file"
              }
            })
            .select("_id orderId amount userId")
            .lean();
          break;

        case "pendingPayments":
          transactions = await OrderModel.find({ paymentStatus: { $ne: "Paid" } })
            .populate("userId", "username")
            .populate({
              path: "items.productId",
              select: "name file"
            })
            .select("_id dueAmount userId items")
            .lean();
          break;

        case "manualPayments":
          transactions = await PaymentModel.find({ paymentType: "manual", status: { $in: ["Paid", "succeeded"] } })
            .populate("userId", "username")
            .populate({
              path: "orderId",
              populate: {
                path: "items.productId",
                select: "name file"
              }
            })
            .select("_id orderId amount userId")
            .lean();
          break;

        default:
          res.status(400).json({ error: "Invalid earnings type" });
          return;
      }

      // Format transactions
      const formattedTransactions = transactions.map(tx => {
        const order = "orderId" in tx ? tx.orderId : null;
        return {
          orderId: order?.toString() || "N/A",
          orderProductName: (order as any)?.items?.[0]?.productId?.name || "N/A",
          productImage: (order as any)?.items?.[0]?.productId?.file?.[0] || "N/A",
          username: typeof tx.userId === "object" && "username" in tx.userId ? (tx.userId as any).username || "N/A" : "N/A",
          amount: "amount" in tx ? tx.amount || 0 : 0
        };
      });

      res.status(200).json({
        type,
        totalEarnings,
        yearlyEarnings,
        todayEarnings,
        pendingPayments,
        manualPayments,
        monthlyEarnings,
        customOrders,
        transactions: formattedTransactions
      });
    } catch (error) {
      console.error("Error fetching earnings details:", error);
      next(error);
    }
  }
  

};

export default EarningsController;
