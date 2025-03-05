import express from "express";
import { getUserNotifications } from "./notification.controller";

const notification = express.Router();

// ✅ Get notifications with pagination
notification.get("/:userId", getUserNotifications);

export default notification;
