import { NextFunction } from "express";

export const NotificationController = {
    getUserNotifications: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const userId = req.user?.id; // Assuming user ID is set in req.user from middleware
  
        // Fetch all notifications for the user
        const notifications = await NotificationModel.find({ userId })
          .sort({ createdAt: -1 }) // Sort by newest first
          .lean();
  
        if (notifications.length === 0) {
          return res.status(404).json({ message: "No notifications found." });
        }
  
        res.status(200).json({ notifications });
      } catch (error) {
        console.error("Error fetching notifications:", error);
        next(error);
      }
    },
  };
  