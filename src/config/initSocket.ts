import { Server } from 'socket.io';
import { MessageService } from '../app/modules/message/message.service';

export const initSocket = (server: any) => {
  const io = new Server(server, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a room based on user ID
    socket.on('joinRoom', (userId: string) => {
      socket.join(userId);
      console.log(`User ${userId} joined room`);
    });

    // Handle sending messages
    socket.on('sendMessage', async (data) => {
      const {  receiverId, content, senderType,messageSource } = data;

      if (!receiverId || !content || !senderType) {
        socket.emit("error", { message: "Missing required fields" });
        return;
      }

      try {
        const message = MessageService.sendMessage(
          //   senderId,
          receiverId,
          content,
          senderType,
          data.productId, // Add the missing productId argument
          messageSource,
        );

        // Emit the message to the receiver's room
        io.to(receiverId).emit('receiveMessage', message);
        socket.emit('messageSent', message); // Notify the sender that the message was sent
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { senderId, receiverId } = data;
      io.to(receiverId).emit('typing', { senderId });
    });

    socket.on('stopTyping', (data) => {
      const { senderId, receiverId } = data;
      io.to(receiverId).emit('stopTyping', { senderId });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};