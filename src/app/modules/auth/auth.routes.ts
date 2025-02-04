import { AuthController } from "./auth.controller";
import express from "express";
// import { AdminService } from "../admin/admin.service";

const router = express.Router();
// Update admin details

router.post("/login", AuthController.login);


export default router;
