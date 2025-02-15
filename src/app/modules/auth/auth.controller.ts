import { Request, Response } from "express";
import { AuthService } from "./auth.service";

export const AuthController = {
  login: async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
      const result = await AuthService.authenticate(email, password);
      res.status(200).json(result);
    } catch (error) {
      // Safely handle the `error` type
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      res.status(401).json({ error: errorMessage });
    }
  },
};
