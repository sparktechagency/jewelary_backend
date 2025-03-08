import { Server } from "socket.io";
import { MessageService } from "../app/modules/message/message.service";

export const initSocket = (server: any) => {
  const io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join room based on user ID (user can join room to receive notifications)
    socket.on("joinRoom", (userId: string) => {
      socket.join(userId);
      console.log(`User ${userId} joined room`);
    });

    // Order status update event
    socket.on("orderStatusUpdate", (data) => {
      console.log("Received order status update:", data);

      const { orderId, orderStatus, message, userId } = data;

      // Emit the order status update to the user in real-time
      io.to(userId).emit("orderStatusUpdate", {
        orderId,
        orderStatus,
        message,
      });

      // Optionally, save the notification to the database (if needed)
      // Notification logic can be added here if you want to store the notifications
    });

    // Sending a message event
    socket.on("sendMessage", async (data) => {
      console.log("Received Socket Message:", data);

      const { receiverId, content, senderType, productId, messageSource, sender } = data;

      if (!receiverId || !content || !senderType || !productId) {
        socket.emit("error", { message: "Missing required fields" });
        return;
      }

      try {
        // Send the message using the MessageService (you can customize the service as needed)
        const message = await MessageService.sendMessage(
          sender,
          receiverId,
          content,
          senderType,
          productId,
          messageSource
        );

      

        // Emit message to the receiver's room (user)
        io.to(receiverId).emit("receiveMessage", message);

        // Confirm the message has been sent to the sender
        socket.emit("messageSent", message);
      } catch (error) {
        console.error("Socket Message Error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Typing indicator event
    socket.on("typing", (data) => {
      const { senderId, receiverId } = data;
      io.to(receiverId).emit("typing", { senderId });
    });

    // Stop typing indicator event
    socket.on("stopTyping", (data) => {
      const { senderId, receiverId } = data;
      io.to(receiverId).emit("stopTyping", { senderId });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};
