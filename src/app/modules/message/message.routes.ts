import express from 'express';
import { MessageController } from './message.controller';
import { isAuthenticated } from '../auth/auth.middleware';

const router = express.Router();

// Route to send message (product page or message box)
router.post('/send', isAuthenticated, MessageController.sendMessage);

// Route to get conversation between user and admin or user and user
router.get('/conversation/:partnerId', isAuthenticated, MessageController.getConversation);

// Route to mark message as read
router.patch('/message/read/:messageId', isAuthenticated, MessageController.markAsRead);

// Admin Route to get all messages (Admin can see all messages)
router.get('/admin/messages', isAuthenticated, MessageController.getAllMessages);

export default router;
