import { AuthController } from "./auth.controller";
import express from "express";
// import { AdminService } from "../admin/admin.service";

const router = express.Router();
router.post("/login", AuthController.login);


export default router;
