// import { Router } from "express";
// // import { EarningsController } from "./controller";
// import { isAuthenticated, isAdmin } from "../auth/auth.middleware";

// const router = Router();

// router.get("/", isAuthenticated, isAdmin, EarningsController.getEarningsDashboard);
// router.get("/", isAuthenticated, isAdmin, EarningsController.getEarningsDetails);

// export default router;
import express from "express";
import EarningsController from "./controller";


const router = express.Router();

router.get("/total", EarningsController.getEarningsDashboard);

router.get("/total/:type", EarningsController.getEarningsDetails);
export default router;
// { path: '', route: EarningRoutes },
// { path: '/earnings/total/:type', route: EarningRoutes },