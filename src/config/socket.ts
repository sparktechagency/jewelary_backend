import { Server } from "socket.io";
import { MessageService } from "../app/modules/message/message.service";

export const initSocket = (server: any) => {
  const io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join room based on user ID
    socket.on("joinRoom", (userId: string) => {
      socket.join(userId);
      console.log(`User ${userId} joined room`);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });

    // Handle sending messages with productId
    socket.on("sendMessage", async (data) => {
      console.log("Received Socket Message:", data); // ✅ Debugging log

      const { receiverId, content, senderType, productId } = data;

      if (!receiverId || !content || !senderType || !productId) {
        socket.emit("error", { message: "Missing required fields" });
        return;
      }

      try {
        const message = await MessageService.sendMessage(receiverId, content, senderType, productId);

        // Emit message to the receiver's room
        io.to(receiverId).emit("receiveMessage", message);

        // Confirm message sent to sender
        socket.emit("messageSent", message);
      } catch (error) {
        console.error("Socket Message Error:", error); // ✅ Debugging log
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle typing indicators
    socket.on("typing", (data) => {
      const { senderId, receiverId } = data;
      io.to(receiverId).emit("typing", { senderId });
    });

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
