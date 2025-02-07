// import express from "express";
// import bodyParser from "body-parser";
// import { createServer } from "http";
// import { Server } from "socket.io";
// import dotenv from "dotenv";

// import { connectDB } from "./config/db.config";
// import productRoutes from "./app/modules/product/product.routes";
// import router from "./routes";
// import userRoutes from "./app/modules/user/user.routes";
// import orderRoutes from "./app/modules/order/order.routes";
// import paymentRoutes from "./app/modules/payment/routes";
// import adminRoutes from "./routes/admin.routes";
// import { PaymentController } from "./app/modules/payment/payment.controller";
// import { adminRouter } from "./app/modules/admin/admin.routes";
// import messageRoutes from "./app/modules/message/message.routes";
// import productAttributeRoutes from "./app/modules/product/productAttributeRoutes";
// import earningRoutes from "./app/modules/earning/earningRoutes";

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || "5000";

// // ✅ Create HTTP server
// const server = createServer(app);

// // ✅ Initialize Socket.io on the same server
// const io = new Server(server, {
//   cors: { origin: "*" },
// });

// // ✅ Socket.io connection handling
// io.on("connection", (socket) => {
//   console.log("⚡ New client connected:", socket.id);

//   socket.on("disconnect", () => {
//     console.log("❌ Client disconnected:", socket.id);
//   });
// });

// // ✅ Use middlewares
// app.use(bodyParser.json());
// app.use("/api", router);
// app.use("/api", orderRoutes);
// app.use("/api", adminRouter);
// app.use("/api/admin", adminRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/auth/users", userRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/orders", orderRoutes);
// app.use("/api/payment", paymentRoutes);
// app.use("/api", adminRoutes);
// app.use("/api/product-attributes", productAttributeRoutes);
// app.use("/api/messages", messageRoutes);
// app.use("/api", earningRoutes);

// // ✅ Test route
// app.get("/", (req, res) => {
//   res.send("I’m alive");
// });

// // ✅ Stripe Webhook (raw body parser needed)
// app.post(
//   "/api/payments/webhook",
//   express.raw({ type: "application/json" }),
//   PaymentController.handleWebhook
// );

// // ✅ Start database connection
// connectDB();

// // ✅ Start the server
// server.listen(PORT, () => {
//   console.log(`🚀 Server & Socket.io running on http://localhost:${PORT}`);
// });

// export default {app, io };

// server.ts
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { connectDB } from "./config/db.config";
import router from "./routes";
import { PaymentController } from "./app/modules/payment/payment.controller";
// import apiRoutes from "../src/routes/admin.routes"
dotenv.config();

const app = express();
const PORT = process.env.PORT || "5000";

// ✅ Create HTTP server
const server = createServer(app);

// ✅ Initialize Socket.io on the same server
const io = new Server(server, {
  cors: { origin: "*" },
});

// ✅ Socket.io connection handling
io.on("connection", (socket) => {
  console.log("⚡ New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// ✅ Use middlewares
app.use(bodyParser.json());

// ✅ Use the consolidated router from index.ts for API routes
app.use("/api", router);
// app.use("/api", apiRoutes);
// ✅ Test route
app.get("/", (req, res) => {
  res.send("I’m alive");
});

// ✅ Stripe Webhook (raw body parser needed)
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.handleWebhook
);

// ✅ Start database connection
connectDB();

// ✅ Start the server
server.listen(PORT, () => {
  console.log(`🚀 Server & Socket.io running on http://localhost:${PORT}`);
});

// Export both app and io
export { app, io };
