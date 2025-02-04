import express from 'express';
import { AdminController } from '../admin/admin.controller';
import { isAdmin, isAuthenticated } from '../auth/auth.middleware';

const router = express.Router();

router.post('/admin', isAuthenticated,isAdmin,AdminController.createAdmin);
router.put('/admin/:id', isAuthenticated,isAdmin,AdminController.updateAdmin);
router.get('/admin/all', isAuthenticated,isAdmin,AdminController.getAdmins);
router.delete('/admin/:id', isAuthenticated,isAdmin,AdminController.deleteAdmin);

export { router as adminRouter };