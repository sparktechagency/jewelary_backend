// user.routes.ts 
import { Router } from 'express';
import { UserController } from './user.controller';
import { isAuthenticated } from '../auth/auth.middleware';
import { profile } from 'console';
import { profileController } from './profile.controller';
// import { getTotalUsers } from './user.controller';

const router = Router();


router.post('/register', UserController.register); // Register user route
router.post('/login', UserController.login); // Login user route
router.post("/forgot-password", UserController.forgotPassword); // Request Password Reset (Send OTP)
router.post("/reset-password", UserController.resetPassword); // Reset Password (Verify OTP and set new password)
router.post("/verify-otp", UserController.verifyOtp);
router.get("/count", isAuthenticated, UserController.getTotalUsers); //get total users
router.get("/alldetails",isAuthenticated,UserController.userAllOrderDetails)
router.get("/search", isAuthenticated, UserController.searchUser); // search user by email
router.delete("/delete/:id", isAuthenticated, UserController.deleteUser); //delete user
router.get("/profile", isAuthenticated, profileController.getUserProfile); // GET user profile
router.put("/profile/update", isAuthenticated, profileController.updateUserProfile); // UPDATE profile
router.put("/change-password", isAuthenticated ,UserController.changePassword); // Set new password after OTP

export default router;
