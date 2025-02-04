import express from "express";
import bodyParser from "body-parser";
import { connectDB } from "./config/db.config";
import productRoutes from "./app/modules/product/product.routes";
import router from "./routes";
import dotenv from "dotenv";
import userRoutes from "./app/modules/user/user.routes";
import orderRoutes from "./app/modules/order/order.routes";
import paymentRoutes from "./app/modules/payment/routes";
import adminRoutes from "./routes/admin.routes";
import { PaymentController } from "./app/modules/payment/payment.controller";
import { adminRouter } from "./app/modules/admin/admin.routes";
import messageRoutes from "./app/modules/message/message.routes";
import { initSocket } from "./config/socket";
import { server } from "typescript";
import productAttributeRoutes from "./app/modules/product/productAttributeRoutes";


dotenv.config();

const socketPort = process.env.SOCKET_PORT || 3000;

const app = express();
// app.use(cors());

app.use(bodyParser.json());
app.use("/api", router);
app.use("/api", orderRoutes);
app.use('/api', adminRouter);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api", adminRoutes);
app.use("/api/product-attributes", productAttributeRoutes);
app.use("/api/messages", messageRoutes); // Register message routes

const io = initSocket(server);

app.post("/api/payments/webhook", express.raw({ type: "application/json" }), PaymentController.handleWebhook);
app.use((req, res, next) => {
  console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
  next();
});

connectDB();
app.use((req, res, next) => {
    console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
    next();
  });
  
export default app;
function cors(): any {
  throw new Error("Function not implemented.");
}

io.listen(Number(socketPort));
    //@ts-ignore
    global.io = io;
    const serverIP = process.env.SERVER_IP || 'localhost';
    console.log(`Socket is listening on port ${serverIP}:${socketPort}`);