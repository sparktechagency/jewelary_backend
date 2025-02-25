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
// import paymentRoutes from "./app/modules/payment/routes"
import authRoutes from "./app/modules/auth/auth.routes";
import { profileController } from "./app/modules/user/profile.controller";
import { ProductController } from "./app/modules/product/product.controller";
import multer from "multer";
import { uploadProduct } from "./app/modules/multer/multer.conf";
// import apiRoutes from "../src/routes/admin.routes"
dotenv.config();
const upload = multer();
const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: ["https://jowel.binarybards.online", "http://10.0.70.206:3000", "http://localhost:3000"], credentials: true
}))
app.use(cors({
  origin: ["http://localhost:3000"], // Make sure the client domain is allowed
  credentials: true,
}))
// app.use(express.json());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.handleWebhook
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.post("/api/products",uploadProduct, ProductController.create)
const PORT = process.env.PORT || "5000";
// ✅ Create HTTP server
const server = createServer(app);

// ✅ Initialize Socket.io on the same server
const io = new Server(server, {
  cors: { origin: "*", credentials: true },
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
app.use(express.urlencoded({ extended: true }));


// ✅ Use the consolidated router from index.ts for API routes
app.use("/api", router);
app.use("/api/auth", authRoutes);
// app.use("/api", apiRoutes);
// ✅ Test route
app.get("/", (req, res) => {
  res.send("I’m alive");
});



// ✅ Start database connection
connectDB();

// ✅ Start the server
server.listen(PORT, () => {
  console.log(`🚀 Server & Socket.io running on http://localhost:${PORT}`);
});

// Export both app and io
export { app, io };

// import express from "express";
// import { createServer } from "http";
// import { Server } from "socket.io";
// import dotenv from "dotenv";
// import cors from "cors";  // ✅ Import cors middleware
// import bodyParser from "body-parser";
// import { connectDB } from "./config/db.config";
// import router from "./routes";
// import path from "path";
// import PaymentRequest from "./app/modules/payment/routes"

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

// // ✅ ⚠️ Move raw body parser **before** JSON parser
// // ✅ Stripe Webhook must come BEFORE bodyParser.json()
// app.use("/api/payments/", express.raw({ type: "application/json" }));
// app.use("/api/payments", PaymentRequest);
// // ✅ Apply CORS Middleware
// app.use(cors());

// // ✅ Other middlewares come after
// app.use(bodyParser.json());
// app.use(express.urlencoded({ extended: true }));

// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// app.use("/api", router);

// // ✅ Test route
// app.get("/", (req, res) => {
//   res.send("I’m alive");
// });

// // ✅ Start database connection
// connectDB();

// // ✅ Start the server
// server.listen(PORT, () => {
//   console.log(`🚀 Server & Socket.io running on http://localhost:${PORT}`);
// });

// // Export both app and io
// export { app, io };
