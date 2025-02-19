import  UserModel  from '../../models/user.model'; // Adjust the import path based on your project structure
import { Types } from 'mongoose';

export class UserService {
  static async userExists(userId: string): Promise<boolean> {
    try {
      // Validate if the userId is a valid MongoDB ObjectId
      if (!Types.ObjectId.isValid(userId)) {
        return false;
      }
      
      const user = await UserModel.findById(userId);
      return !!user;
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  }

  static async canStartConversation(userId: string, partnerId: string): Promise<boolean> {
    try {
      // Validate if both IDs are valid MongoDB ObjectIds
      if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(partnerId)) {
        return false;
      }

      // First, check if both users exist
      const [user, partner] = await Promise.all([
        UserModel.findById(userId),
        UserModel.findById(partnerId)
      ]);

      if (!user || !partner) {
        return false;
      }

  
      return true;
    } catch (error) {
      console.error('Error checking conversation permission:', error);
      return false;
    }
  }
}