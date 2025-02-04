import express, { NextFunction, Request, Response } from 'express';
import { MessageController } from './message.controller';
import { isAuthenticated } from '../auth/auth.middleware';
import { MessageService } from './message.service';

const router = express.Router();

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

  router.post('/send', isAuthenticated, asyncHandler(MessageController.sendMessage));
  router.get('/conversation/:partnerId', isAuthenticated, asyncHandler(MessageController.getConversation));
  router.patch('/message/read/:messageId', isAuthenticated, asyncHandler(MessageController.markAsRead));
  
  export default router;
  