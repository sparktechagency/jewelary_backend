import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { connectDB } from "./config/db.config";
import router from "./routes";
import { PaymentController } from "./app/modules/payment/payment.controller";
import path from "path";
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
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));
// console.log("Static files served from:", path.join(__dirname, "../uploads"));


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
