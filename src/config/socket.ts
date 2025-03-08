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
    socket.on("orderStatusUpdate", (data) => {
      console.log("Received order status update:", data);

    // Handle sending messages with productId
    // socket.on("sendMessage", async (data) => {
    //   console.log("Received Socket Message:", data); // ✅ Debugging log

    //   const { receiverId, content, senderType, productId,messageSource } = data;

    //   if (!receiverId || !content || !senderType || !productId) {
    //     socket.emit("error", { message: "Missing required fields" });
    //     return;
    //   }

    //   try {
    //     const message = await MessageService.sendMessage(receiverId, content, senderType, productId,messageSource);

    //     // Emit message to the receiver's room
    //     io.to(receiverId).emit("receiveMessage", message);

    //     // Confirm message sent to sender
    //     socket.emit("messageSent", message);
    //   } catch (error) {
    //     console.error("Socket Message Error:", error); // ✅ Debugging log
    //     socket.emit("error", { message: "Failed to send message" });
    //   }
    // });

    socket.on("sendMessage", async (data) => {
      const { receiverId, content, senderType, productId, messageSource,sender } = data;

      if (!receiverId || !content || !senderType) {
        socket.emit("error", { message: "Missing required fields" });
        return;
      }

      const finalProductId = (messageSource === 'productPage' && senderType === 'user') ? productId : null;

      try {
        const message = await MessageService.sendMessage(receiverId, content, senderType, finalProductId, messageSource, sender);
        io.to(receiverId).emit("receiveMessage", message);
        socket.emit("messageSent", message);
      } catch (error) {
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

  io.on("connection", (socket) => {
    console.log("Admin connected:", socket.id);
  
    socket.on("disconnect", () => {
      console.log("Admin disconnected:", socket.id);
    });
  });

  return io;
})};

