import { Router } from "express";
import { EarningsController } from "./controller";
import { isAuthenticated, isAdmin } from "../auth/auth.middleware";

const router = Router();

router.get("/earnings/total", isAuthenticated, isAdmin, EarningsController.getTotalEarnings);
router.get("/earnings/monthly", isAuthenticated, isAdmin, EarningsController.getMonthlyEarnings);
router.get("/earnings/yearly", isAuthenticated, isAdmin, EarningsController.getYearlyEarnings);
router.get("/earnings/pending", isAuthenticated, isAdmin, EarningsController.getPendingPayments);
router.get("/earnings/manual", isAuthenticated, isAdmin, EarningsController.getManualEntries);
router.get("/earnings/today", isAuthenticated, isAdmin, EarningsController.getTodayEarnings);

export default router;
