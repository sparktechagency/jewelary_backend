import express from "express";
import { AuthController } from "./auth.controller";
// import { AdminService } from "../admin/admin.service";

const router = express.Router();
router.post("/login", AuthController.login);


export default router;
