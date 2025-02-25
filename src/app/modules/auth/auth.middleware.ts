import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../../types/express';
import jwt from 'jsonwebtoken';
import UserModel from '../../models/user.model';
import mongoose from 'mongoose';


export const isAuthenticated = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "No token provided, authorization denied" });
    return;
  }

  const secretKey = process.env.JWT_SECRET || "default_secret";
  try {
    const decoded = jwt.verify(token, secretKey) as { userId: string; role?: string };
    // console.log("Decoded Token:", decoded);

    req.user = { id: decoded.userId, role: decoded.role };
    next();
  } catch (error) {
    console.log("Token verification error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "No token provided." });
      return;
    }
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
    req.user = { id: (decoded.userId).toString(), role: decoded.role }; // Adjust as needed
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    res.status(401).json({ message: "Invalid or expired token." });
  }
  
};

// export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
//   if (!req.user || req.user.role !== 'admin') {
//     res.status(403).json({ message: "Access denied. Admins only." });
//     return;
//   }
//   next();
// };

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ message: "Access denied. Admins only." });
    return;
  }
  next();
};



export const generateToken = (userId: string, role: string): string => {
  const secretKey = process.env.JWT_SECRET || "default_secret";
  return jwt.sign({ userId, role }, secretKey, { expiresIn: "4d" }); // Ensure `userId` instead of `id`
};


