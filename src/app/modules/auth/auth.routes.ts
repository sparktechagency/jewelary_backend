import express from "express";
import { AuthController } from "./auth.controller";
import { AdminController } from "../admin/admin.controller";
// import { AdminService } from "../admin/admin.service";

const router = express.Router();
router.post("/login", AuthController.login);
// router.post("/login", AdminController.login);


export default router;
