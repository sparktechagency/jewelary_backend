import express from 'express';
import { AdminController } from './admin.controller';
import multer from 'multer';
import { isAdmin, isAuthenticated, verifyToken } from '../auth/auth.middleware';
import { AdminNotificationController } from './admin.notification';

// Multer configuration (storage setup)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueName = Date.now() + '-' + file.originalname;
      cb(null, uniqueName);
    },
  });
const upload = multer({ storage });
const router = express.Router();

// Public routes (no authentication required)
router.post('/login', AdminController.login);

// Routes that require authentication and admin role
router.post('/create',   AdminController.createAdmin); // Only admins can create other admins
router.get('/profile', verifyToken, isAdmin, AdminController.getProfile);
router.get("/notifications", AdminNotificationController.getAdminNotifications);
router.put('/updateProfile', upload.single('image'), AdminController.updateProfile);

// Mark a notification as read
router.patch("/notifications/read/:notificationId", AdminNotificationController.markNotificationAsRead);

router.post('/change-password', verifyToken, isAdmin, AdminController.changePassword);

export { router as adminRoutes };