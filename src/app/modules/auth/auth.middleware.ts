import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';




export const isAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
  const token = (req.headers as Record<string, string>)['authorization']?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "No token provided, authorization denied" });
    return;
  }

  const secretKey = process.env.JWT_SECRET || "default_secret";
  try {
    const decoded = jwt.verify(token, secretKey) as { userId: string; role?: string };
    console.log("Decoded Token:", decoded);  // Check if decoded token has userId and role
    req.user = { id: decoded.userId, role: decoded.role };
    next();
  } catch (error) {
    console.log("Token verification error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};




export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ message: "Access denied. Admins only." });
    return;
  }
  next();
};


export const generateToken = (userId: string, role: string): string => {
  const secretKey = process.env.JWT_SECRET || "default_secret";
  return jwt.sign({ userId, role }, secretKey, { expiresIn: "1d" }); // Ensure `userId` instead of `id`
};

