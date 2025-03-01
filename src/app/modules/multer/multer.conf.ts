// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import { NextFunction, Request } from "express";

// // ✅ Function to create storage dynamically based on type
// const createStorage = (folder: string) => multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = path.join(__dirname, `../../../uploads/${folder}`);
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }
//     cb(null, uploadDir);  // Save to specific folder
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
//     cb(null, `${uniqueSuffix}-${file.originalname.replace(/\s+/g, "-")}`);
//   }
// });


// // ✅ File filter for allowed file types
// const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
//   const allowedMimeTypes = ["image/jpeg", "image/png", "application/pdf"];
//   if (allowedMimeTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Invalid file type. Only JPGEG, PNG, and PDF are allowed."));
//   }
// };

// // ✅ Multer configurations for different file uploads
// export const uploadCategory = multer({
//   storage: createStorage("categories"),
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
//   fileFilter
// }).single("image"); // ✅ Must match Postman form-data key

// // 🔥 Debugging to log the field names received
// export const uploadDebug = (req: Request, res: Response, next: NextFunction) => {
//   console.log("🔍 Incoming Request Fields:", req.body);
//   console.log("🔍 Incoming Files:", req.files);
//   next();
// };

// export const uploadProduct = multer({
//   storage: createStorage("products"),
//   limits: { fileSize: 5 * 1024 * 1024, files: 10 },
//   fileFilter
// }).any(); // ✅ Accepts any file field, allowing both "image" and "images"


// export const uploadProduct = multer({
//   storage: createStorage("products"),
//   limits: { fileSize: 5 * 1024 * 1024, files: 10 },
//   fileFilter
// }).any();

// export const uploadOrder = multer({
//   storage: createStorage("receipts"),
//   limits: { fileSize: 5 * 1024 * 1024, files: 5 }, // ✅ Max 5 files
//   fileFilter
// }).fields([
//   { name: "receipts", maxCount: 5 }
// ]);

// export const uploadImages = (folder: string) => multer({
//   storage: createStorage(folder),
//   limits: { fileSize: 5 * 1024 * 1024 },  // Limit file size to 5MB
//   fileFilter
// }).any();  // Accept any file field


import multer from "multer";
import path from "path";
import fs from "fs";
import { NextFunction, Request } from "express";

// Function to create storage dynamically based on the folder type
const createStorage = (folder: string) => multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, `../../../uploads/${folder}`);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });  // Create folder if it doesn't exist
    }
    cb(null, uploadDir);  // Save to the specified folder
  },
  filename: (req, file, cb) => {
    const folderName = req.params.folder || folder;
    let fileIndex = 1;

    // Get existing files to determine the next index
    const uploadDir = path.join(__dirname, `../../../uploads/${folderName}`);
    if (fs.existsSync(uploadDir)) {
      const existingFiles = fs.readdirSync(uploadDir);
      const imageFiles = existingFiles.filter(file =>
        /^image-\d+\.(jpg|jpeg|png|gif)$/i.test(file)
      );

      if (imageFiles.length > 0) {
        // Extract existing indices and find the highest one
        const indices = imageFiles.map(file => {
          const match = file.match(/^image-(\d+)\./);
          return match ? parseInt(match[1], 10) : 0;
        });
        fileIndex = Math.max(...indices) + 1;  // Increment to the next available index
      }
    }

    // Generate the filename using the sequential index
    const fileExtension = path.extname(file.originalname);
    cb(null, `image-${fileIndex}${fileExtension}`);
  }
});

// File filter for allowed file types
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, and GIF are allowed."));
  }
};

// Multer configuration for accepting multiple files
export const uploadAdvertisement = multer({
  storage: createStorage("advertisements"),  // Upload to 'advertisements' folder
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },  // Max 10 files, 5MB each
  fileFilter
}).any();



// Multer configuration for accepting multiple files
export const uploadImages = (folder: string) => multer({
  storage: createStorage(folder),
  limits: { fileSize: 5 * 1024 * 1024 },  // Max file size 5MB
  fileFilter
}).any();  // Accepts multiple files with field name 'files[]'

// **Add the export for uploadAdvertisementImages** specifically for advertisements
// Multer configuration for accepting multiple files
// export const uploadAdvertisement = multer({
//   storage: createStorage("advertisements"),  // Upload to 'advertisements' folder
//   limits: { fileSize: 5 * 1024 * 1024, files: 10 },  // Max 10 files, 5MB each
//   fileFilter
// }).any();

export const uploadOrder = multer({
  storage: createStorage("receipts"),
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }, // ✅ Max 5 files
  fileFilter
}).fields([
  { name: "receipts", maxCount: 5 }
]);
export const uploadProduct = multer({
  storage: createStorage("products"),
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
  fileFilter
}).fields([
  { name: "fileUrls", maxCount: 10 }
]);

export const uploadCategory = multer({
  storage: createStorage("categories"),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter
}).fields([{ name: "image", maxCount: 10 }]); // ✅ Must match Postman form-data key

export const uploadDebug = (req: Request, res: Response, next: NextFunction) => {
  console.log("🔍 Incoming Request Fields:", req.body);
  console.log("🔍 Incoming Files:", req.files);
  next();
};



