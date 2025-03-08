import express from 'express';
import { MessageController } from './message.controller';
import { isAdmin, isAuthenticated, verifyToken } from '../auth/auth.middleware';
import { uploadAttachments, uploadImages, uploadMessageFiles, uploadVoiceMessage } from '../multer/multer.conf';

const router = express.Router();

// Route to send message (product page or message box)
router.post('/send', isAuthenticated, uploadMessageFiles, MessageController.sendMessage);
router.post("/send-voice", uploadVoiceMessage, MessageController.sendVoiceMessage);
router.post("/attachments", uploadAttachments, MessageController.uploadAttachments);
// Route to get conversation between user and admin or user and user
router.get('/conversation', isAuthenticated, MessageController.getConversation);

// Route to mark message as read
router.patch('/read/:messageId', isAuthenticated, MessageController.markAsRead);
router.post('/admin/send-message', verifyToken,uploadMessageFiles, MessageController.sendAdminMessage);
router.get('/all-users-messages', isAuthenticated, MessageController.getAllUserMessages);
router.get('/all-user-admin',isAuthenticated, MessageController.getAdminUserConversations );
router.get('/adminGetById/:userId', isAuthenticated, MessageController.getUserConversationByAdmin )

// router.get('/all-admin-messages', isAuthenticated, MessageController.getAllAdminMessages);


export default router;
