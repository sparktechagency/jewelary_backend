import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../../types/express';
import jwt from 'jsonwebtoken';


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
  return jwt.sign({ userId, role }, secretKey, { expiresIn: "1d" }); // Ensure `userId` instead of `id`
};

