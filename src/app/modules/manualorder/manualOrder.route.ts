import express from "express";
import {
  addManualOrder,
  getManualOrdersSummary,
} from "./manualOrderController";
import { isAuthenticated } from "../auth/auth.middleware";

const manualOrderRoutes = express.Router();

// ✅ Add a Manual Order
manualOrderRoutes.post("/manual-orders", isAuthenticated, addManualOrder);
manualOrderRoutes.get("/summary", isAuthenticated, getManualOrdersSummary);
export default manualOrderRoutes;
