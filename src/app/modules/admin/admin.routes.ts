import express from 'express';
import { AdminController } from '../admin/admin.controller';
import { isAdmin, isAuthenticated } from '../auth/auth.middleware';

const router = express.Router();

// router.post('/', isAuthenticated,isAdmin,AdminController.createAdmin);
router.post("/forget",AdminController.forgotPassword)
router.post("/verify-otp", AdminController.verifyOtp);
router.post("/reset-password", AdminController.resetPassword);
router.post("/changepass", AdminController.changePassword);
router.post("/change-password", AdminController.changeAdminPassword);
router.put('/:id', isAuthenticated,isAdmin,AdminController.updateAdmin);
router.get('/all', isAuthenticated,isAdmin,AdminController.getAdmins);
router.delete('/:id', isAuthenticated,isAdmin,AdminController.deleteAdmin);

export { router as adminRoutes};