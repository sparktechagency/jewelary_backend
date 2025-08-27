import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { connectDB } from "./config/db.config";
import router from "./routes";
import { PaymentController } from "./app/modules/payment/payment.controller";
import path from "path";
import authRoutes from "./app/modules/auth/auth.routes";
import { profileController } from "./app/modules/user/profile.controller";
import { ProductController } from "./app/modules/product/product.controller";
import multer from "multer";
import { uploadProduct } from "./app/modules/multer/multer.conf";
import apiRoutes from "../src/routes/admin.routes"
dotenv.config();
const upload = multer();
const app = express();

app.use(cors({
  origin: ["https://jowel.binarybards.online", "http://10.0.70.206:3000", "http://localhost:3000","https://relaxed-alfajores-57dad2.netlify.app"],
  credentials: true
}));
app.use(cors({
  origin: ["http://localhost:3000","https://relaxed-alfajores-57dad2.netlify.app"], 
  credentials: true,
}))
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('Hello Server Is Running')
app.post("/api/products",uploadProduct, ProductController.create)
// app.use("/api/products", uploadProduct, ProductController.create);

// ✅ Fix: Ensure raw body for Stripe webhooks
app.use((req, res, next) => {
  if (req.originalUrl === "/api/payments/webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});


//This are cors


app.use("/api", router);
app.use("/api/auth", authRoutes);
app.use("/api", apiRoutes);


// ✅ Webhook must parse raw body
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.handleWebhook
);


const SocketPort = process.env.SocketPort || "5000";

// ✅ Create HTTP server
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*", credentials: true } });


// ✅ Socket.io connection handling
io.on("connection", (socket) => {
  console.log("⚡ New client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});


// ✅ Start database connection
connectDB();

// ✅ Start the server
server.listen(SocketPort, () => {
  console.log(`🚀 Server & Socket.io running on http://72.60.42.191:${SocketPort}`);
});

// Export both app and io
export { app, io };