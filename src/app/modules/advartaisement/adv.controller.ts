import { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";

// Generic controller to handle the uploaded images for any folder
// export const uploadImagesController = (req: Request, res: Response, next: NextFunction): void => {
//   try {
//     // Get the folder from request params
//     const folder = req.params.folder || "general";
    
//     // Access the uploaded files
//     const files = req.files as Express.Multer.File[];
    
//     if (!files || files.length === 0) {
//       res.status(400).json({ message: "No files uploaded" });
//       return;
//     }

//     // Generate file paths for response
//     const filePaths = files.map(file => `/uploads/${folder}/${file.filename}`);

//     // Respond with the file paths
//     res.status(200).json({
//       message: "Files uploaded successfully",
//       folder: folder,
//       count: files.length,
//       filePaths
//     });
//   } catch (error) {
//     console.error(`Error uploading images to ${req.params.folder}:`, error);
//     const errorMessage = error instanceof Error ? error.message : "Unknown error";
//     res.status(500).json({ message: "Error uploading files", error: errorMessage });
//   }
// };

// // Controller to handle retrieving and sorting uploaded images from specific folder
// export const getImagesController = (req: Request, res: Response, next: NextFunction): void => {
//   try {
//     // Get the folder from request params
//     const folder = req.params.folder || "general";
    
//     // Define the path to the directory where images are stored
//     const imagesDir = path.join(__dirname, `../../../uploads/${folder}`);

//     // Check if the directory exists
//     if (!fs.existsSync(imagesDir)) {
//       res.status(404).json({ message: `Image directory for ${folder} not found.` });
//       return;
//     }

//     // Read the files in the directory
//     fs.readdir(imagesDir, (err: NodeJS.ErrnoException | null, files: string[]) => {
//       if (err) {
//         console.error(`Error reading ${folder} directory:`, err);
//         return res.status(500).json({ message: "Error reading directory", error: err.message });
//       }

//       // Filter out non-image files
//       const uploadedFiles = files.filter(file =>
//         file.toLowerCase().endsWith(".jpg") || 
//         file.toLowerCase().endsWith(".jpeg") || 
//         file.toLowerCase().endsWith(".png") ||
//         file.toLowerCase().endsWith(".pdf")
//       );

//       // If no uploaded images are found
//       if (uploadedFiles.length === 0) {
//         return res.status(404).json({ message: `No uploaded files found in ${folder}.` });
//       }

//       // Sort the files by their names (image-1, image-2, etc.)
//       const sortedFiles = uploadedFiles.sort((a, b) => {
//         const matchA = a.match(/^image-(\d+)\./);
//         const matchB = b.match(/^image-(\d+)\./);
        
//         const indexA = matchA ? parseInt(matchA[1], 10) : 0;
//         const indexB = matchB ? parseInt(matchB[1], 10) : 0;
        
//         return indexA - indexB;
//       });

//       // Generate the file paths for each sorted image
//       const filePaths = sortedFiles.map(file => `/uploads/${folder}/${file}`);

//       // Return the sorted image paths
//       res.status(200).json({
//         message: `Files from ${folder} retrieved and sorted successfully.`,
//         folder: folder,
//         count: filePaths.length,
//         filePaths
//       });
//     });
//   } catch (error) {
//     console.error(`Error getting images from ${req.params.folder}:`, error);
//     const errorMessage = error instanceof Error ? error.message : "Unknown error";
//     res.status(500).json({ message: "Error retrieving files", error: errorMessage });
//   }
// };

export const uploadImagesController = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const folder = req.params.folder || "general";  // Get folder name from params or default to "general"
      
      // Access the uploaded files
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
         res.status(400).json({ message: "No files uploaded" });
         return
      }
  
      // Generate file paths for response
      const filePaths = files.map(file => `/uploads/${folder}/${file.filename}`);
  
      // Respond with the file paths
      res.status(200).json({
        message: "Files uploaded successfully",
        folder: folder,
        count: files.length,
        filePaths
      });
    } catch (error) {
      console.error(`Error uploading images to ${req.params.folder}:`, error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Error uploading files", error: errorMessage });
    }
  };

  export const renameImageController = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { filename } = req.params;  // Get the current filename from URL parameters
      const { newName } = req.body;     // Get the new name from the request body
  
      if (!newName || !filename) {
         res.status(400).json({ message: "Filename and new name are required." });
         return
      }
  
      const folder = req.params.folder || "general";  // Get folder name from params or default to "general"
      const oldFilePath = path.join(__dirname, "../../../uploads", folder, filename);
      const newFilePath = path.join(__dirname, "../../../uploads", folder, newName);
  
      // Check if the file exists
      if (!fs.existsSync(oldFilePath)) {
         res.status(404).json({ message: "File not found." });
         return
      }
  
      // Rename the file
      fs.rename(oldFilePath, newFilePath, (err) => {
        if (err) {
          console.error("Error renaming file:", err);
          return res.status(500).json({ message: "Error renaming file", error: err.message });
        }
  
        // Respond with success message and new file path
        res.status(200).json({
          message: "Image name updated successfully.",
          newFilePath: `/uploads/${folder}/${newName}`
        });
      });
    } catch (error) {
      console.error("Error renaming image:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Error renaming image", error: errorMessage });
    }
  };
  // Controller to handle retrieving and sorting uploaded images from specific folder
  export const getImagesController = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const folder = req.params.folder || "general";  // Get folder from request params
      const imagesDir = path.join(__dirname, `../../../uploads/${folder}`);
  
      // Check if the directory exists
      if (!fs.existsSync(imagesDir)) {
         res.status(404).json({ message: `Image directory for ${folder} not found.` });
         return
      }
  
      // Read the files in the directory
      fs.readdir(imagesDir, (err: NodeJS.ErrnoException | null, files: string[]) => {
        if (err) {
          console.error(`Error reading ${folder} directory:`, err);
          return res.status(500).json({ message: "Error reading directory", error: err.message });
        }
  
        // Filter out non-image files
        const uploadedFiles = files.filter(file =>
          file.toLowerCase().endsWith(".jpg") ||
          file.toLowerCase().endsWith(".jpeg") ||
          file.toLowerCase().endsWith(".png") ||
          file.toLowerCase().endsWith(".gif")
        );
  
        // If no uploaded images are found
        if (uploadedFiles.length === 0) {
          return res.status(404).json({ message: `No uploaded files found in ${folder}.` });
        }
  
        // Sort the files by their name (image-1, image-2, etc.)
        const sortedFiles = uploadedFiles.sort((a, b) => {
          const matchA = a.match(/^image-(\d+)\./);
          const matchB = b.match(/^image-(\d+)\./);
          
          const indexA = matchA ? parseInt(matchA[1], 10) : 0;
          const indexB = matchB ? parseInt(matchB[1], 10) : 0;
          
          return indexA - indexB;
        });
  
        // Generate the file paths for each sorted image
        const filePaths = sortedFiles.map(file => `/uploads/${folder}/${file}`);
  
        // Return the sorted image paths
        res.status(200).json({
          message: `Files from ${folder} retrieved and sorted successfully.`,
          folder: folder,
          count: filePaths.length,
          filePaths
        });
      });
    } catch (error) {
      console.error(`Error getting images from ${req.params.folder}:`, error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Error retrieving files", error: errorMessage });
    }
  };
// Specific controller for advertisement uploads
export const uploadAdvertisementImages = (req: Request, res: Response, next: NextFunction): void => {
  // Set the folder parameter for the generic controller
  req.params.folder = "advertisements";
  return uploadImagesController(req, res, next);
};

// Specific controller for advertisement retrieval
export const getAdvertisementImages = (req: Request, res: Response, next: NextFunction): void => {
  // Set the folder parameter for the generic controller
  req.params.folder = "advertisements";
  return getImagesController(req, res, next);
};
