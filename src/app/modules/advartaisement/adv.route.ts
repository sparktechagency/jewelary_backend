// routes.ts
import express from "express";
import { isAuthenticated } from "../auth/auth.middleware"; // Assuming this middleware exists
import { 
  uploadImages, 
  uploadProduct, 
  uploadAdvertisement 
} from "../multer/multer.conf";
import {
  uploadImagesController,
//   getImagesController,
  uploadAdvertisementImages,
  getAdvertisementImages,
  getImagesController,
  renameImageController
} from "./adv.controller";

const router = express.Router();

router.get(
  "/images/:folder", 
  isAuthenticated, 
  getImagesController
);

// Specific routes for advertisements
router.post(
  "/upload-ads-images", 
  isAuthenticated, 
  uploadAdvertisement, 
  uploadAdvertisementImages,
  getImagesController
);

router.get(
  "/get-ads-images", 
  isAuthenticated, 
  getAdvertisementImages
);



router.put(
  "/edit-image-name/:filename", 
    isAuthenticated,
    renameImageController

);
export default router;