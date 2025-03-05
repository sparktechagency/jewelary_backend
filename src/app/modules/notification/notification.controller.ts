import NotificationModel from "../../models/notificationModel";
import { Request, Response, NextFunction } from 'express';
// export const getUserNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   try {
//     const { userId } = req.params;
//     const { status } = req.query;
//     const page = parseInt(req.query.page as string) || 1;
//     const limit = parseInt(req.query.limit as string) || 12;
//     const skip = (page - 1) * limit;

//     if (!userId) {
//        res.status(400).json({ message: "User ID is required." });
//        return
//     }

//     // ✅ Build query with optional orderStatus filter
//     const query: any = { userId };
//     if (status) {
//       query.orderStatus = status; // ✅ Ensure filtering by orderStatus
//     }

//     // ✅ Fetch notifications with pagination
//     const notifications = await NotificationModel.find(query)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .select("_id userId message orderStatus seen createdAt"); // ✅ Ensure `orderStatus` is included

//     const totalNotifications = await NotificationModel.countDocuments(query);

//     res.status(200).json({
//       totalNotifications,
//       totalPages: Math.ceil(totalNotifications / limit),
//       currentPage: page,
//       notifications,
      
//     });
//   } catch (error) {
//     next(error);
//   }
// };

export const getUserNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const { status } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    if (!userId) {
      res.status(400).json({ message: "User ID is required." });
      return;
    }

    const query: any = { userId };
    if (status) {
      query.orderStatus = status;
    }

    const notifications = await NotificationModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("_id userId message orderId orderStatus seen createdAt"); // ✅ orderId included here

    const totalNotifications = await NotificationModel.countDocuments(query);

    res.status(200).json({
      total: totalNotifications,
      notifications,
    });
    
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : "Internal Server Error" });
  }
};
