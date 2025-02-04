import { Router } from "express";
import { PaymentController } from "./payment.controller";
import { isAuthenticated } from "../auth/auth.middleware";
import bodyParser from "body-parser";

const router = Router();

// Process payment
router.post("/pay", isAuthenticated, PaymentController.processPayment);
router.get("/admin/payments", isAuthenticated, PaymentController.viewPayments);
// Stripe Webhook (use raw body for Stripe signature verification)
router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  PaymentController.handleWebhook
);


export default router;
