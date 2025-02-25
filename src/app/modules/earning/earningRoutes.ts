import { Router } from "express";
import { EarningsController } from "./controller";
import { isAuthenticated, isAdmin } from "../auth/auth.middleware";

const router = Router();

router.get("/", isAuthenticated, isAdmin, EarningsController.getEarningsDashboard);
router.get("/", isAuthenticated, isAdmin, EarningsController.getMonthlyEarnings);
router.get("/", isAuthenticated, isAdmin, EarningsController.getYearlyEarnings);
router.get("/", isAuthenticated, isAdmin, EarningsController.getPendingPayments);
router.get("/", isAuthenticated, isAdmin, EarningsController.getManualEntries);
router.get("/", isAuthenticated, isAdmin, EarningsController.getTodayEarnings);

export default router;
