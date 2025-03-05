import { Request, Response, NextFunction } from "express";
import NotificationModel from "../../models/notificationModel";
import { getOrderStatus } from "../order/order.controller";

export const AdminNotificationController = {

  // Fetch all admin notifications
  getAdminNotifications: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log("📌 Fetching Admin Notifications...");

      const notifications = await NotificationModel.find({ userId: null }).sort({ createdAt: -1 });

      console.log("✅ Admin Notifications Found:", notifications.length);

      res.status(200).json({
        //add orderStatus to the select method
        getOrderStatus,
        success: true,
        notifications,
      });
    } catch (error) {
      console.error("❌ Error Fetching Admin Notifications:", error);
      next(error);
    }
  },

  // Mark a notification as read
  markNotificationAsRead: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { notificationId } = req.params;

      const notification = await NotificationModel.findById(notificationId);
      if (!notification) {
        res.status(404).json({ success: false, message: "Notification not found" });
        return;
      }

      notification.seen = true;
      await notification.save();

      res.status(200).json({
        success: true,
        message: "Notification marked as read",
        notification,
      });
    } catch (error) {
      console.error("Error Updating Notification:", error);
      next(error);
    }
  },
};
