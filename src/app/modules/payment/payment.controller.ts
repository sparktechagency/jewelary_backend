import { Request, Response, NextFunction } from "express";
import Stripe from "stripe";

import dotenv from "dotenv";
import PaymentModel from "../../models/payment.model";
import OrderModel from "../../models/order.model";
import UserModel from "../../models/user.model";
dotenv.config();

// Stripe initialization with the correct API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || " ", {
  apiVersion: "2025-01-27.acacia", // Keep the API version as specified
  // Stripe initialization
});

// Custom type for raw request body
interface RawBodyRequest extends Request {
  rawBody?: Buffer;
}
export const PaymentController = {


 
  processPayment: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orderId, paymentType, amount } = req.body;
      const userId = (req.user as { id: string }).id;

      // Find the order
      const order = await OrderModel.findById(orderId);
      if (!order) {
        res.status(404).json({ message: "Order not found." });
        return;
      }

      if (order.paymentStatus === "Paid") {
        res.status(400).json({ message: "Order is already fully paid." });
        return;
      }

      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        res.status(400).json({ message: "Invalid payment amount." });
        return;
      }

      if (parsedAmount > order.dueAmount) {
        res.status(400).json({ message: "Payment exceeds due amount." });
        return;
      }

      // Create Stripe Checkout Session for Partial or Full Payment
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Order #${orderId}`,
              },
              unit_amount: parsedAmount * 100, // Convert to cents
            },
            quantity: 1,
          },
        ],
        metadata: {
          userId: userId,
          orderId: orderId.toString(),
          amountPaid: parsedAmount.toString(),
        },
        // success_url: `${process.env.FRONTEND_URL}/api/payments/success?session_id={CHECKOUT_SESSION_ID}`,
        success_url: `${process.env.FRONTEND_URL}/api/payments/success`,
        cancel_url: `${process.env.FRONTEND_URL}/api/payments/cancel`,
      });

      // Save only the session ID for now, payment status is "pending"
      await PaymentModel.create({
        userId,
        orderId,
        amount: order.totalAmount,
        paidAmount: 0,
        dueAmount: order.dueAmount,
        paymentType,
        status: "pending", // Set as "pending" until payment is confirmed
        paymentIntentId: session.id, // Store Stripe session ID
      });

      // Return payment link to the frontend
      res.status(200).json({
        message: "Payment link generated successfully.",
        paymentLink: session.url, // Send the Stripe checkout link
      });
    } catch (error) {
      console.error("Error processing payment:", error);
      next(error);
    }
  },

   successPage:async( req:Request, res:Response,next: NextFunction): Promise<void> => {
    // console.log('hit hoise');
    res.render('success.ejs');
  },
  
   cancelPage:async(  req:Request, res:Response,next: NextFunction): Promise<void> => {
    res.render('cancel.ejs');
  },


  handleWebhook: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const sig = req.headers["stripe-signature"];

    // Log the headers and raw body for debugging
    console.log("🔹 Stripe-Signature:", sig);
    console.log("🔹 Raw Body:", req.body); // Log raw body content

    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!sig || !endpointSecret) {
      console.error("❌ Missing Stripe signature or webhook secret.");
       res.status(400).json({ message: "Webhook verification failed." });
       return
      }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      console.log("✅ Webhook received:", event.type);
    } catch (err) {
      console.error("❌ Webhook verification failed:", err);
       res.status(400).json({ message: "Webhook verification failed." });
       return
      }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const { orderId, amountPaid } = session.metadata ?? {};

      if (!orderId || !amountPaid) {
        console.error("❌ Missing orderId or amountPaid in metadata.");
         res.status(400).json({ message: "Invalid metadata in payment session." });
         return
        }

      const order = await OrderModel.findById(orderId);
      if (!order) {
        console.error("❌ Order not found.");
         res.status(404).json({ message: "Order not found." });
         return
        }

      const paidAmount = parseFloat(amountPaid);
      order.paidAmount += paidAmount;
      order.dueAmount -= paidAmount;
      order.paymentStatus = order.dueAmount === 0 ? "Paid" : "Partial";
      await order.save();

      await PaymentModel.findOneAndUpdate(
        { paymentIntentId: session.id },
        { status: "succeeded", paidAmount: order.paidAmount, dueAmount: order.dueAmount },
        { new: true }
      );

      console.log("✅ Order updated successfully:", order);
       res.json({ received: true, message: "Payment successful, order updated." });
       return
      } else {
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
      res.json({ received: true });
    }
  },

  getPartialPayments: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Find all partial payments
      const partialPayments = await PaymentModel.find({ paymentType: "partial" })
        .sort({ createdAt: 1 })
        .select("paidAmount dueAmount createdAt");

      if (!partialPayments.length) {
        res.status(404).json({ message: "No partial payments found" });
        return;
      }

      // Get the number of partial payments
      const count = partialPayments.length;

      // Get details of every payment amount and due amount
      const paymentsDetails = partialPayments.map(payment => ({
        id: payment.id,
        paidAmount: payment.paidAmount,
        dueAmount: payment.dueAmount,
        createdAt: payment.createdAt,
      }));

      // Get the last payment details
      const lastPayment = partialPayments[partialPayments.length - 1];

      res.json({
        count,
        
        paymentsDetails,
        lastPayment: {
          paidAmount: lastPayment.paidAmount,
          dueAmount: lastPayment.dueAmount,
          createdAt: lastPayment.createdAt,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },

  getUserPayments: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const user = await UserModel.findById(userId);

      if (!user) {
        res.status(404).json({ message: "User not found." });
        return;
      }

      const payments = await PaymentModel.find({ userId }).sort({ createdAt: -1 });
      
      if (!payments.length) {
        res.status(404).json({ message: "No payments found for this user." });
        return;
      }

      // Filter partial payments
      const partialPayments = payments.filter(payment => payment.paymentType === "partial");
      const partialCount = partialPayments.length;
      const totalPartialAmount = partialPayments.reduce((sum, payment) => sum + payment.paidAmount, 0);

      res.json({
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        payments,
        partialPaymentSummary: {
          count: partialCount,
          paid:totalPartialAmount,
          totalAmount: totalPartialAmount,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },

viewPayments: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Ensure only admin can access
      // if (!req.user || req.user.role !== 'admin') {
      //   res.status(403).json({ message: "Access denied" });
      //   return;
      // }

      // Fetch all payments made by users
      const payments = await PaymentModel.find().populate('userId');
      if (!payments) {
        res.status(404).json({ message: "No payments found." });
        return;
      }

      res.status(200).json({
        payments,
        message: "Payments fetched successfully.",
      });
    } catch (error) {
      next(error);
    }
  },
};
function async(arg0: (req: any, res: any) => void) {
  throw new Error("Function not implemented.");
}

