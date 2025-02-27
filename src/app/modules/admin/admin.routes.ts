import express from 'express';
import { AdminController } from '../admin/admin.controller';
import { isAdmin, isAuthenticated, verifyToken } from '../auth/auth.middleware';
import { AuthController } from '../auth/auth.controller';

const router = express.Router();
router.put('/profile', verifyToken, isAdmin, AuthController.updateAdminProfile);
router.post('/change-password', verifyToken, isAdmin, AuthController.changePassword);

export { router as adminRoutes};