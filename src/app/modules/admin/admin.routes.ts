import express from 'express';
import { AdminController } from './admin.controller';
import { isAdmin, isAuthenticated, verifyToken } from '../auth/auth.middleware';

const router = express.Router();

// Public routes (no authentication required)
router.post('/login', AdminController.login);

// Routes that require authentication and admin role
router.post('/create',   AdminController.createAdmin); // Only admins can create other admins
router.get('/profile', verifyToken, isAdmin, AdminController.getProfile);
router.post('/change-password', verifyToken, isAdmin, AdminController.changePassword);

export { router as adminRoutes };