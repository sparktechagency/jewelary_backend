// import { Request, Response } from "express";
// import { AuthService } from "./auth.service";

// export const AuthController = {
//   login: async (req: Request, res: Response) => {
//     const { email, password } = req.body;
//     try {
//       const result = await AuthService.authenticate(email, password);
//       res.status(200).json(result);
//       console.log(result)
//     } catch (error) {
//       // Safely handle the `error` type
//       const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
//       res.status(401).json({ error: errorMessage });
//     }
//   },
// };


import { Request, Response } from "express";
import { AuthService } from "./auth.service";  // Your authentication service

export const AuthController = {
  login: async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
      // Authenticate admin and get the JWT token
      const result = await AuthService.authenticate(email, password);

      // Return JWT token and other user details
      res.status(200).json({
        message: "Login successful",
        token: result.token,
        role: result.role,
        email: result.email,
        id: result.id,  // Admin ID returned from AuthService
      });
    } catch (error) {
      // Error handling for invalid credentials
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      res.status(401).json({ error: errorMessage });
    }
  },
};
