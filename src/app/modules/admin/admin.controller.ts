import { Request, Response } from 'express';
import { AdminService } from './admin.service';
import { AdminCreateDTO, AdminUpdateDTO } from '../../../types/admin.types';

export class AdminController {
  static async createAdmin(req: Request, res: Response) {
    try {
      const adminData: AdminCreateDTO = {
        username: req.body.username,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password
      };

      const admin = await AdminService.createAdmin(adminData);
      res.status(201).json('Admin created successfully');
    } catch (error: any) {
      res.status(400).json({ 
        error: error.message || 'Failed to create admin'
      });
    }
  };

  static async updateAdmin(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const updateData: AdminUpdateDTO = {};

      if (req.body.username) updateData.username = req.body.username;
      if (req.body.email) updateData.email = req.body.email;
      if (req.body.phone) updateData.phone = req.body.phone;
      if (req.body.password) updateData.password = req.body.password;

      const admin = await AdminService.updateAdmin(id, updateData);
      res.json(admin);
    } catch (error: any) {
      res.status(400).json({ 
        error: error.message || 'Failed to update admin'
      });
    }
  };
  //get all admins
  static async getAdmins(req: Request, res: Response) {
    try {
      const admins = await AdminService.getAdmins();
      res.json(admins);
    } catch (error: any) {
      res.status(400).json({ 
        error: error.message || 'Failed to fetch admins'
      });
    }
  };
   //delete admin
    static async deleteAdmin(req: Request, res: Response) {
      try {
        const id = req.params.id;
        AdminService.deleteAdmin(id);
        res.json('Admin deleted successfully');
      } catch (error: any) {
        res.status(400).json({ 
          error: error.message || 'Failed to delete admin'
        });
      };
    }
}