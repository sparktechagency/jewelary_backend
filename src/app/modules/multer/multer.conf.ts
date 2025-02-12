// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import { Request } from "express"; // Import Request from express

// export const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = path.join(__dirname, "../../../uploads/receipts");
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
//     cb(null, `${uniqueSuffix}-${file.originalname}`);
//   }
// });

// const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
//   const allowedMimeTypes = ["image/jpeg", "image/png", "application/pdf"];
//   if (allowedMimeTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Invalid file type. Only JPG, PNG and PDF are allowed."));
//   }
// };

// // Create and export the multer middleware
// // export const upload = multer({
// //   storage: storage,
// //   limits: {
// //     fileSize: 5 * 1024 * 1024, // 5MB
// //     files: 5 // max 5 files
// //   },
// //   fileFilter: fileFilter
// // }).fields([
// //   { name: "image", maxCount: 1 }, 
// //   { name: 'receipts', maxCount: 5 }
// // ]);

// export const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB per file
//     files: 10 // ✅ Allow up to 10 files
//   },
//   fileFilter: fileFilter
// }).fields([
//   { name: "images", maxCount: 1 }, // ✅ Should match Postman form-data key
//   { name: "receipts", maxCount: 5 }
// ]);

import multer from "multer";
import path from "path";
import fs from "fs";
import { NextFunction, Request } from "express";

// ✅ Function to create storage dynamically based on type
const createStorage = (folder: string) => multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, `../../../uploads/${folder}`);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname.replace(/\s+/g, "-")}`);
  }
});

// ✅ File filter for allowed file types
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPG, PNG, and PDF are allowed."));
  }
};

// ✅ Multer configurations for different file uploads
export const uploadCategory = multer({
  storage: createStorage("categories"),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter
}).single("image"); // ✅ Must match Postman form-data key

// 🔥 Debugging to log the field names received
export const uploadDebug = (req: Request, res: Response, next: NextFunction) => {
  console.log("🔍 Incoming Request Fields:", req.body);
  console.log("🔍 Incoming Files:", req.files);
  next();
};

export const uploadProduct = multer({
  storage: createStorage("products"),
  limits: { fileSize: 5 * 1024 * 1024, files: 10 }, // ✅ Max 10 files
  fileFilter
}).fields([
  { name: "images", maxCount: 10 }
]);

export const uploadOrder = multer({
  storage: createStorage("receipts"),
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }, // ✅ Max 5 files
  fileFilter
}).fields([
  { name: "receipts", maxCount: 5 }
]);
