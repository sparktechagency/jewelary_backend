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

// export const uploadProduct = multer({
//   storage: createStorage("products"),
//   limits: { fileSize: 5 * 1024 * 1024, files: 10 }, // ✅ Max 10 files
//   fileFilter
// }).fields([
//   { name: "images", maxCount: 10 }
// ]);

export const uploadProduct = multer({
  storage: createStorage("products"),
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
  fileFilter
}).any(); // ✅ Accepts any file field, allowing both "image" and "images"


// export const uploadProduct = multer({
//   storage: createStorage("products"),
//   limits: { fileSize: 5 * 1024 * 1024, files: 10 },
//   fileFilter
// }).any();

export const uploadOrder = multer({
  storage: createStorage("receipts"),
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }, // ✅ Max 5 files
  fileFilter
}).fields([
  { name: "receipts", maxCount: 5 }
]);
