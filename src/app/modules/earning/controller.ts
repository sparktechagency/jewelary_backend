import { Request, Response, NextFunction } from "express";
import PaymentModel from "../../models/payment.model";
import OrderModel from "../../models/order.model";
import UserModel from "../../models/user.model";  // Import UserModel for calculating total users
import moment from "moment";
import { PipelineStage } from "mongoose";

const EarningsController = {
  getEarningsDashboard: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
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
        totalSalesAgg,
        totalProfitAgg,
        totalUsersAgg
      ] = await Promise.all([
        PaymentModel.aggregate([{ $match: { status: "succeeded" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
        PaymentModel.aggregate([{ $match: { status: "succeeded", createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
        PaymentModel.aggregate([{ $match: { status: "succeeded", createdAt: { $gte: startOfYear } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
        PaymentModel.aggregate([{ $match: { status: "succeeded", createdAt: { $gte: startOfToday } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
        OrderModel.aggregate([{ $match: { paymentStatus: { $ne: "Paid" } } }, { $group: { _id: null, total: { $sum: "$dueAmount" } } }]),
        PaymentModel.aggregate([{ $match: { paymentType: "manual" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
        OrderModel.aggregate([{ $group: { _id: null, totalSales: { $sum: "$totalAmount" } } }]),
        OrderModel.aggregate([{ $group: { _id: null, totalSales: { $sum: "$totalAmount" }, totalPaid: { $sum: "$paidAmount" } } }, { $project: { profit: { $subtract: ["$totalSales", "$totalPaid"] } } }]),
        UserModel.aggregate([{ $count: "totalUsers" }])
      ]);

      res.status(200).json({
        totalEarnings: totalEarningsAgg[0]?.total || 0,
        monthlyEarnings: monthlyEarningsAgg[0]?.total || 0,
        yearlyEarnings: yearlyEarningsAgg[0]?.total || 0,
        todayEarnings: todayEarningsAgg[0]?.total || 0,
        pendingPayments: pendingPaymentsAgg[0]?.total || 0,
        manualPayments: manualPaymentsAgg[0]?.total || 0,
        totalSales: totalSalesAgg[0]?.totalSales || 0,
        totalProfit: totalProfitAgg[0]?.profit || 0,
        totalUsers: totalUsersAgg[0]?.totalUsers || 0
      });
    } catch (error) {
      next(error);
    }
  },

  
  // getEarningsDetails: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   try {
  //     const { type } = req.params;
  //     let filter: any = {};
  //     let totalEarnings = 0;
  //     let yearlyEarnings = 0;
  //     let todayEarnings = 0;
  //     let pendingPayments = 0;
  //     let manualPayments = 0;
  
  //     // Date Filters
  //     const startOfMonth = moment().startOf("month").toDate();
  //     const startOfYear = moment().startOf("year").toDate();
  //     const startOfToday = moment().startOf("day").toDate();
  
  //     // Fetch earnings summary
  //     const [
  //       totalEarningsAgg,
  //       yearlyEarningsAgg,
  //       todayEarningsAgg,
  //       pendingPaymentsAgg,
  //       manualPaymentsAgg
  //     ] = await Promise.all([
  //       PaymentModel.aggregate([
  //         { $match: { status: { $in: ["Paid", "succeeded"] } } }, // Match "Paid" or "succeeded"
  //         { $group: { _id: null, total: { $sum: "$amount" } } }
  //       ]),
  
  //       PaymentModel.aggregate([
  //         { $match: { status: { $in: ["Paid", "succeeded"] }, createdAt: { $gte: startOfYear } } }, // Filter for this year
  //         { $group: { _id: null, total: { $sum: "$amount" } } }
  //       ]),
  
  //       PaymentModel.aggregate([
  //         { $match: { status: { $in: ["Paid", "succeeded"] }, createdAt: { $gte: startOfToday } } }, // Filter for today
  //         { $group: { _id: null, total: { $sum: "$amount" } } }
  //       ]),
  
  //       OrderModel.aggregate([
  //         { $match: { paymentStatus: { $ne: "Paid" } } },
  //         { $group: { _id: null, total: { $sum: "$dueAmount" } } }
  //       ]),
  
  //       PaymentModel.aggregate([
  //         { $match: { paymentType: "manual", status: { $in: ["Paid", "succeeded"] } } }, // Only manual payments with "Paid" or "succeeded"
  //         { $group: { _id: null, total: { $sum: "$amount" } } }
  //       ])
  //     ]);
  
  //     // Ensure that values default to 0 if aggregation returns no data
  //     totalEarnings = totalEarningsAgg.length > 0 ? totalEarningsAgg[0].total : 0;
  //     yearlyEarnings = yearlyEarningsAgg.length > 0 ? yearlyEarningsAgg[0].total : 0;
  //     todayEarnings = todayEarningsAgg.length > 0 ? todayEarningsAgg[0].total : 0;
  //     pendingPayments = pendingPaymentsAgg.length > 0 ? pendingPaymentsAgg[0].total : 0;
  //     manualPayments = manualPaymentsAgg.length > 0 ? manualPaymentsAgg[0].total : 0;
  
  //     let transactions = [];
  
  //     // Determine filter and fetch transactions based on type
  //     switch (type) {

  //       case "totalEarnings":
  //         transactions = await PaymentModel.find({ status: { $in: ["Paid", "succeeded"] }, createdAt: { $gte: startOfMonth } })
  //           .populate("userId", "username")
  //           .populate({
  //             path: "orderId",
  //             populate: {
  //               path: "items.productId",
  //               select: "name file"
  //             }
  //           })
  //           .select("_id orderId amount userId")
  //           .lean();
  //         break;

  //       case "monthlyEarnings":
  //         transactions = await PaymentModel.find({ status: { $in: ["Paid", "succeeded"] }, createdAt: { $gte: startOfMonth } })
  //           .populate("userId", "username")
  //           .populate({
  //             path: "orderId",
  //             populate: {
  //               path: "items.productId",
  //               select: "name file"
  //             }
  //           })
  //           .select("_id orderId amount userId")
  //           .lean();
  //         break;
  
  //       case "yearlyEarnings":
  //         transactions = await PaymentModel.find({ status: { $in: ["Paid", "succeeded"] }, createdAt: { $gte: startOfYear } })
  //           .populate("userId", "username")
  //           .populate({
  //             path: "orderId",
  //             populate: {
  //               path: "items.productId",
  //               select: "name file"
  //             }
  //           })
  //           .select("_id orderId amount userId")
  //           .lean();
  //         break;
  
  //       case "todayEarnings":
  //         transactions = await PaymentModel.find({ status: { $in: ["Paid", "succeeded"] }, createdAt: { $gte: startOfToday } })
  //           .populate("userId", "username")
  //           .populate({
  //             path: "orderId",
  //             populate: {
  //               path: "items.productId",
  //               select: "name file"
  //             }
  //           })
  //           .select("_id orderId amount userId")
  //           .lean();
  //         break;
  
  //       case "pendingPayments":
  //         transactions = await OrderModel.find({ paymentStatus: { $ne: "Paid" } })
  //           .populate("userId", "username")
  //           .populate({
  //             path: "items.productId",
  //             select: "name file"
  //           })
  //           .select("_id dueAmount userId items")
  //           .lean();
  //         break;
  
  //       case "manualPayments":
  //         transactions = await PaymentModel.find({ paymentType: "manual", status: { $in: ["Paid", "succeeded"] } })
  //           .populate("userId", "username")
  //           .populate({
  //             path: "orderId",
  //             populate: {
  //               path: "items.productId",
  //               select: "name file"
  //             }
  //           })
  //           .select("_id orderId amount userId")
  //           .lean();
  //         break;
  
  //       default:
  //         res.status(400).json({ error: "Invalid earnings type" });
  //         return;
  //     }
  
  //     // Format transactions based on their source (PaymentModel or OrderModel)
  //     const formattedTransactions = transactions.map(tx => {
  //       if ("orderId" in tx && tx.orderId) {
  //         // Payment Transaction - Extract from `orderId`
  //         const order = tx.orderId as any;
  //         return {
  //           orderId: order?._id?.toString() || "N/A",
  //           orderProductName:
  //             order?.items?.[0]?.productId &&
  //             typeof order?.items?.[0]?.productId === "object"
  //               ? (order.items[0].productId as any)?.name || "N/A"
  //               : "N/A",
  //           productImage:
  //             order?.items?.[0]?.productId &&
  //             typeof order?.items?.[0]?.productId === "object"
  //               ? (order.items[0].productId as any)?.file?.[0] || "N/A"
  //               : "N/A",
  //           username: (tx.userId as any)?.username || "N/A",
  //           amount: tx.amount || 0
  //         };
  //       } else if ("items" in tx) {
  //         // Order Transaction - Extract from `items`
  //         return {
  //           orderId: tx._id?.toString() || "N/A",
  //           orderProductName:
  //             tx.items?.[0]?.productId &&
  //             typeof tx.items?.[0]?.productId === "object"
  //               ? (tx.items[0].productId as any)?.name || "N/A"
  //               : "N/A",
  //           productImage:
  //             tx.items?.[0]?.productId &&
  //             typeof tx.items?.[0]?.productId === "object"
  //               ? (tx.items[0].productId as any)?.file?.[0] || "N/A"
  //               : "N/A",
  //           username: (tx.userId as any)?.username || "N/A",
  //           amount: tx.dueAmount || 0
  //         };
  //       } else {
  //         return {
  //           orderId: "N/A",
  //           orderProductName: "N/A",
  //           productImage: "N/A",
  //           username: "N/A",
  //           amount: 0
  //         };
  //       }
  //     });
  
  //     // Log if transactions are empty
  //     if (!formattedTransactions || formattedTransactions.length === 0) {
  //       console.log(`No transactions found for ${type}`);
  //     }
  
  //     res.status(200).json({
  //       type,
  //       totalEarnings,
  //       yearlyEarnings,
  //       todayEarnings,
  //       pendingPayments,
  //       manualPayments,
  //       transactions: formattedTransactions
  //     })
  //   } catch (error) {
  //     next(error);
  //   };
  //   }
  // };
  getEarningsDetails: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type } = req.params;
      let filter: any = {};
      let totalEarnings = 0;
      let yearlyEarnings = 0;
      let todayEarnings = 0;
      let pendingPayments = 0;
      let manualPayments = 0;
  
      // Date Filters
      const startOfMonth = moment().startOf("month").toDate();
      const startOfYear = moment().startOf("year").toDate();
      const startOfToday = moment().startOf("day").toDate();
  
      console.log("Start of Today: ", startOfToday);  // Debugging the date filter for today
  
      // Fetch earnings summary using aggregation
      const [
        totalEarningsAgg,
        yearlyEarningsAgg,
        todayEarningsAgg,
        pendingPaymentsAgg,
        manualPaymentsAgg
      ] = await Promise.all([
        // Total earnings aggregation for "Paid" and "succeeded" payments
        PaymentModel.aggregate([
          { $match: { status: { $in: ["Paid", "succeeded"] } } }, // Match "Paid" or "succeeded"
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),
  
        // Yearly earnings aggregation for "Paid" and "succeeded" payments
        PaymentModel.aggregate([
          { $match: { status: { $in: ["Paid", "succeeded"] }, createdAt: { $gte: startOfYear } } }, // Filter for this year
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),
  
        // Today's earnings aggregation for "Paid" and "succeeded" payments
        PaymentModel.aggregate([
          { $match: { status: { $in: ["Paid", "succeeded"] }, createdAt: { $gte: startOfToday } } }, // Filter for today
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),
  
        // Pending payments aggregation (orders that are not marked as "Paid")
        OrderModel.aggregate([
          { $match: { paymentStatus: { $ne: "Paid" } } },
          { $group: { _id: null, total: { $sum: "$dueAmount" } } }
        ]),
  
        // Manual payments aggregation (only "manual" payments with "Paid" status)
        PaymentModel.aggregate([
          { $match: { paymentType: "manual", status: { $in: ["Paid", "succeeded"] } } }, // Filter manual payments with "Paid" or "succeeded"
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ])
      ]);
  
      // Ensure values default to 0 if aggregation returns no data
      totalEarnings = totalEarningsAgg.length > 0 ? totalEarningsAgg[0].total : 0;
      yearlyEarnings = yearlyEarningsAgg.length > 0 ? yearlyEarningsAgg[0].total : 0;
      todayEarnings = todayEarningsAgg.length > 0 ? todayEarningsAgg[0].total : 0;
      pendingPayments = pendingPaymentsAgg.length > 0 ? pendingPaymentsAgg[0].total : 0;
      manualPayments = manualPaymentsAgg.length > 0 ? manualPaymentsAgg[0].total : 0;
  
      let transactions = [];
  
      // Determine filter and fetch transactions based on the earnings type (monthly, yearly, etc.)
      switch (type) {
        case "totalEarnings":
          transactions = await PaymentModel.find({ status: { $in: ["Paid", "succeeded"] } })
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
  
      // Format transactions based on their source (PaymentModel or OrderModel)
      const formattedTransactions = transactions.map(tx => {
        if ("orderId" in tx && tx.orderId) {
          // Payment Transaction - Extract from `orderId`
          const order = tx.orderId as any;
          return {
            orderId: order?._id?.toString() || "N/A",
            orderProductName:
              order?.items?.[0]?.productId &&
              typeof order?.items?.[0]?.productId === "object"
                ? (order.items[0].productId as any)?.name || "N/A"
                : "N/A",
            productImage:
              order?.items?.[0]?.productId &&
              typeof order?.items?.[0]?.productId === "object"
                ? (order.items[0].productId as any)?.file?.[0] || "N/A"
                : "N/A",
            username: (tx.userId as any)?.username || "N/A",
            amount: tx.amount || 0
          };
        } else if ("items" in tx) {
          // Order Transaction - Extract from `items`
          return {
            orderId: tx._id?.toString() || "N/A",
            orderProductName:
              tx.items?.[0]?.productId &&
              typeof tx.items?.[0]?.productId === "object"
                ? (tx.items[0].productId as any)?.name || "N/A"
                : "N/A",
            productImage:
              tx.items?.[0]?.productId &&
              typeof tx.items?.[0]?.productId === "object"
                ? (tx.items[0].productId as any)?.file?.[0] || "N/A"
                : "N/A",
            username: (tx.userId as any)?.username || "N/A",
            amount: tx.dueAmount || 0
          };
        } else {
          return {
            orderId: "N/A",
            orderProductName: "N/A",
            productImage: "N/A",
            username: "N/A",
            amount: 0
          };
        }
      });
  
      // Log if transactions are empty
      if (!formattedTransactions || formattedTransactions.length === 0) {
        console.log(`No transactions found for ${type}`);
      }
  
      res.status(200).json({
        type,
        totalEarnings,
        yearlyEarnings,
        todayEarnings,
        pendingPayments,
        manualPayments,
        transactions: formattedTransactions
      });
    } catch (error) {
      console.error("Error fetching earnings details:", error);
      next(error);
    }
  }
};

export default EarningsController;
