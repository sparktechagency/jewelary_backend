// import { Router } from "express";
// import { PaymentController } from "./payment.controller";
// import { isAuthenticated } from "../auth/auth.middleware";
// import express from "express";

// const router = Router();

// // Process payment
// router.post("/", isAuthenticated, PaymentController.processPayment);
// router.get("/", isAuthenticated, PaymentController.viewPayments);

// // Webhook route - use express.raw() for Stripe
// router.post(
//   "/webhook",
//   express.raw({ type: 'application/json' }),
//   PaymentController.handleWebhook
// );

// export default router;

import { Router } from "express";
import { PaymentController } from "./payment.controller";
import { isAuthenticated } from "../auth/auth.middleware";
import express from "express";

const router = Router();

// ✅ Process Payment - Generate Payment Link
router.post("/", isAuthenticated, PaymentController.processPayment);
router.get("/", isAuthenticated, PaymentController.viewPayments);
router.get("/partial-payments", PaymentController.getPartialPayments);
router.get("/user/:userId", PaymentController.getUserPayments);
router.get('/success', PaymentController.successPage);
router.get('/cancel', PaymentController.cancelPage);
// ✅ Webhook route - use express.raw() for Stripe
// router.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),  // This ensures raw body parsing
//   PaymentController.handleWebhook
// );

export default router;
