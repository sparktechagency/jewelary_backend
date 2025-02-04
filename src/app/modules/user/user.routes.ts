// user.routes.ts 
import { Router } from 'express';
import { UserController } from './user.controller';
import { isAuthenticated } from '../auth/auth.middleware';
// import { getTotalUsers } from './user.controller';

const router = Router();


router.post('/register', UserController.register); // Register user route
router.post('/login', UserController.login); // Login user route
router.get("/count", isAuthenticated, UserController.getTotalUsers); //get total users
router.get("/search", isAuthenticated, UserController.searchUser); // search user by email
router.delete("/delete/:id", isAuthenticated, UserController.deleteUser); //delete user
router.post("/forgot-password", UserController.forgotPassword); // Request Password Reset (Send OTP)
router.post("/reset-password", UserController.resetPassword); // Reset Password (Verify OTP and set new password)
router.post("/cart", isAuthenticated, UserController.addToCart); //add to cart
router.put("/cart", isAuthenticated, UserController.updateCart); //update cart
router.delete("/cart", isAuthenticated, UserController.deleteCartItem); //delete cart item
router.get("/cart", isAuthenticated, UserController.getCart); //get cart
export default router;
