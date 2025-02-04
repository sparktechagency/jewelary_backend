import { AdminModel } from '../../models/admin.model';
import { AdminCreateDTO, AdminUpdateDTO, AdminResponse } from '../../../types/admin.types';

export class AdminService {

  static async createAdmin(adminData: AdminCreateDTO): Promise<AdminResponse> {
    try {
      const admin = new AdminModel(adminData);
      await admin.save();
      
      const adminObj = admin.toObject();
      const { password, ...adminWithoutPassword } = adminObj;
      
      return adminWithoutPassword as AdminResponse;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error('Username or email already exists');
      }
      throw error;
    }
  }

  static async updateAdmin(id: string, updateData: AdminUpdateDTO): Promise<AdminResponse> {
    try {
      const admin = await AdminModel.findById(id);
      
      if (!admin) {
        throw new Error('Admin not found');
      }

      // Update only provided fields
      if (updateData.username) admin.username = updateData.username;
      if (updateData.email) admin.email = updateData.email;
      if (updateData.password) admin.password = updateData.password;

      await admin.save();
      
      const adminObj = admin.toObject();
      const { password, ...adminWithoutPassword } = adminObj;
      
      return adminWithoutPassword as AdminResponse;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error('Username or email already exists');
      }
      throw error;
    }
  }
  //get all admins
  static async getAdmins(): Promise<AdminResponse[]> {
    try {
      const admins = await AdminModel.find();
      return admins.map(admin => {
        const adminObj = admin.toObject();
        const { password, ...adminWithoutPassword } = adminObj;
        return adminWithoutPassword as AdminResponse;
      });
    } catch (error: any) {
      throw error;
    }
  }
  //delete admin
  static async deleteAdmin(id: string): Promise<void> {
    try {
      await AdminModel.findByIdAndDelete(id);
    } catch (error: any) {
      throw error;
    }
  }
}