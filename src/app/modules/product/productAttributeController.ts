import { Request, Response } from "express";
import ProductAttributeModel from "../../models/attribute/ProductAttribute";
import ColorModel from "../../models/attribute/attribute.color";
// import ThicknessModel from "../../models/attribute/attribute.thikness";
import SizeModel from "../../models/attribute/attribute.size";
import mongoose from "mongoose";

export const ProductAttributeController = {
  // createColor: async (req: Request, res: Response): Promise<void> => {
  //   try {
  //     const { color } = req.body;
  
  //     if (!color) {
  //       res.status(400).json({ message: "Color is required" });
  //       return;
  //     }
  
  //     // Check if the color already exists
  //     const existingColor = await ColorModel.findOne({ color });
  //     if (existingColor) {
  //       res.status(400).json({ message: "Color already exists" });
  //       return;
  //     }
  
  //     // Create a new color and save it with the default active status (true)
  //     const newColor = new ColorModel({ color });
  //     await newColor.save();
  
  //     res.status(201).json(newColor);
  //   } catch (error) {
  //     res.status(500).json({ message: (error as Error).message });
  //   }
  // },
  
   createColor:async (req: Request, res: Response): Promise<void> => {
    try {
      const { colorName, colorCode } = req.body;
  
      // Ensure both colorName and colorCode are provided
      if (!colorName || !colorCode) {
        res.status(400).json({ message: "Color name and color code are required." });
        return;
      }
  
      // Check if the color already exists
      const existingColor = await ColorModel.findOne({ colorName });
      if (existingColor) {
        res.status(400).json({ message: "Color name already exists." });
        return;
      }
  
      // Check if the colorCode already exists
      const existingColorCode = await ColorModel.findOne({ colorCode });
      if (existingColorCode) {
        res.status(400).json({ message: "Color code already exists." });
        return;
      }
  
      // Create a new color and save it
      const newColor = new ColorModel({ colorName, colorCode});
      await newColor.save();
  
      res.status(201).json(newColor);  // Return the newly created color
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  },
  createSize: async (req: Request, res: Response): Promise<void> => {
    try {
      const { size } = req.body;
  
      if (!size) {
        res.status(400).json({ message: "Size is required" });
        return;
      }
  
      // Check if the size already exists
      const existingSize = await SizeModel.findOne({ size });
      if (existingSize) {
        res.status(400).json({ message: "Size already exists" });
        return;
      }
  
      // Create a new size and save it with the default active status (true)
      const newSize = new SizeModel({ size });
      await newSize.save();
  
      res.status(201).json(newSize);
    } catch (error: any) {
      // Handle duplicate key errors from MongoDB
      if (error.code && error.code === 11000) {
        res.status(400).json({ message: "Duplicate key error: Size already exists" });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  },

  updateSize: async (req: Request, res: Response): Promise<void> => {
    try {
      const { sizeId, active } = req.body; // colorId to identify the color, and active to set the status
  
      // 1. Check if colorId is provided and is a valid ObjectId
      if (!sizeId || !mongoose.Types.ObjectId.isValid(sizeId)) {
         res.status(400).json({ message: "Invalid or missing SizeId format." });
         return
      }
  
      // 2. Check if active is provided and is a boolean
      if (typeof active !== "boolean") {
         res.status(400).json({ message: "Active field must be a boolean." });
         return
      }
  
      // 3. Find the color by its ID and update the active status
      const updatedSize = await SizeModel.findByIdAndUpdate(
        sizeId,
        { active },  // Update the active status
        { new: true }  // Return the updated document
      );
  
      // 4. Handle case when color is not found
      if (!updatedSize) {
         res.status(404).json({ message: "size not found." });
         return
      }
  
      // 5. Return the updated color
      res.status(200).json({
        message: "Size updated successfully.",
        color: updatedSize,
      });
    } catch (error) {
      console.error("Error updating color:", error);
      res.status(500).json({ message: (error as Error).message });
    }
  },

  updateSizeb: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;  // Get the size ID from the URL
      const { size, active } = req.body;  // Get the new size value and active status from the body
  
      // Validate if size is provided
      if (!size) {
         res.status(400).json({ message: "Size is required" })
         return;
      }
  
      // Find the size by ID
      const existingSize = await SizeModel.findById(id);
      if (!existingSize) {
         res.status(404).json({ message: "Size not found" });
         return
      }
  
      // Check if the new size already exists
      const sizeExists = await SizeModel.findOne({ size });
      if (sizeExists) {
         res.status(400).json({ message: "Size already exists" });
         return
      }
  
      // If 'active' is provided, ensure it's a boolean, otherwise leave the default value
      if (active !== undefined && typeof active !== "boolean") {
         res.status(400).json({ message: "Active field must be a boolean." });
         return
      }
  
      // Update the size and active field (if provided)
      existingSize.size = size;
      if (active !== undefined) {
        existingSize.active = active;  // Update active field if provided
      }
  
      // Save the updated size
      await existingSize.save();
  
      res.status(200).json({
        message: "Size updated successfully",
        size: existingSize,
      });
    } catch (error: any) {
      console.error("Error updating size:", error);
      res.status(500).json({ message: "Error updating size.", error });
    }
  },
  
  // createThikness:async (req: Request, res: Response): Promise<void> => {
  //   try {
  //     const { colorName, colorCode } = req.body;
  
  //     // Ensure both colorName and colorCode are provided
  //     if (!colorName || !colorCode) {
  //       res.status(400).json({ message: "Color name and color code are required." });
  //       return;
  //     }
  
  //     // Check if the color already exists
  //     const existingColor = await ColorModel.findOne({ colorName });
  //     if (existingColor) {
  //       res.status(400).json({ message: "Color name already exists." });
  //       return;
  //     }
  
  //     // Check if the colorCode already exists
  //     const existingColorCode = await ColorModel.findOne({ colorCode });
  //     if (existingColorCode) {
  //       res.status(400).json({ message: "Color code already exists." });
  //       return;
  //     }
  
  //     // Create a new color and save it
  //     const newColor = new ColorModel({ colorName, colorCode });
  //     await newColor.save();
  
  //     res.status(201).json(newColor);  // Return the newly created color
  //   } catch (error) {
  //     res.status(500).json({ message: (error as Error).message });
  //   }
  // },
  

  
  // createThickness: async (req: Request, res: Response): Promise<void> => {
  //   try {
  //     const { thickness } = req.body;
  
  //     // Check that both thickness and price are provided
  //     if (!thickness) {
  //       res.status(400).json({ message: "Thickness and price are required." });
  //       return;
  //     }
  
  //     const existingThickness = await ThicknessModel.findOne({ thickness});
  //     if (existingThickness) {
  //       res.status(400).json({ message: "Thickness already exists" });
  //       return;
  //     }
  
  //     // Include price when creating the new thickness document
  //     const newThickness = new ThicknessModel({ thickness });
  //     await newThickness.save();
  
  //     res.status(201).json({
  //       message: "Thickness created successfully",
  //       data: newThickness,
  //     });
  //   } catch (error: any) {
  //     if (error.code === 11000) {
  //       res.status(400).json({ message: "Duplicate thickness value", error });
  //     } else {
  //       res.status(500).json({ message: "Internal server error", error });
  //     }
  //   }
  // },
  
  // updateThicknessb: async (req: Request, res: Response): Promise<void> => {
  //   try {
  //     const { id } = req.params;  // Get the size ID from the URL
  //     const { thickness, active } = req.body;  // Get the new size value and active status from the body
  
  //     // Validate if size is provided
  //     if (!thickness) {
  //        res.status(400).json({ message: "Size is required" })
  //        return;
  //     }
  
  //     // Find the size by ID
  //     const existingthickness = await ThicknessModel.findById(id);
  //     if (!existingthickness) {
  //        res.status(404).json({ message: "Size not found" });
  //        return
  //     }
  
  //     // Check if the new size already exists
  //     const sizeExists = await SizeModel.findOne({ thickness });
  //     if (sizeExists) {
  //        res.status(400).json({ message: "Size already exists" });
  //        return
  //     }
  
  //     // If 'active' is provided, ensure it's a boolean, otherwise leave the default value
  //     if (active !== undefined && typeof active !== "boolean") {
  //        res.status(400).json({ message: "Active field must be a boolean." });
  //        return
  //     }
  
  //     // Update the size and active field (if provided)
  //     existingthickness.thickness = thickness;
  //     if (active !== undefined) {
  //       existingthickness.active = active;  // Update active field if provided
  //     }
  
  //     // Save the updated size
  //     await existingthickness.save();
  
  //     res.status(200).json({
  //       message: "Size updated successfully",
  //       size: existingthickness,
  //     });
  //   } catch (error: any) {
  //     console.error("Error updating size:", error);
  //     res.status(500).json({ message: "Error updating size.", error });
  //   }
  // },
  
//   // Admin function to update thickness status (active or inactive)
// updateThickness : async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { thicknessId, active } = req.body;

//     // Check if the active status is a boolean
//     if (typeof active !== "boolean") {
//       res.status(400).json({ message: "Active field must be a boolean." });
//       return;
//     }

//     // Log the thicknessId for debugging purposes
//     console.log("Received thicknessId:", thicknessId);

//     // Check if the thicknessId is valid
//     if (!mongoose.Types.ObjectId.isValid(thicknessId)) {
//       res.status(400).json({ message: "Invalid thicknessId format." });
//       return;
//     }

//     // Find the thickness by its ID and update the active status
//     const updatedThickness = await ThicknessModel.findByIdAndUpdate(
//       thicknessId,
//       { active },
//       { new: true }  // Return the updated document
//     );

//     if (!updatedThickness) {
//       res.status(404).json({ message: "Thickness not found." });
//       return;
//     }

//     res.status(200).json(updatedThickness);  // Return the updated thickness
//   } catch (error) {
//     console.error("Error updating thickness:", error);
//     res.status(500).json({ message: (error as Error).message });
//   }},

// Get all active thickness records
// getThickness: async (req: Request, res: Response): Promise<void> => {
//   try {
//     // Fetch all thicknesses that are active
//     const Thicknesses = await ThicknessModel.find();

//     res.status(200).json({ Thicknesses });
//   } catch (error) {
//     res.status(500).json({ message: (error as Error).message });
//   }
// },
// getInactiveThickness: async (req: Request, res: Response): Promise<void> => {
//   try {
//     // Fetch all colors that are inactive
//     const inactiveThickness = await ColorModel.find({ active: false });

//     res.status(200).json({ inactiveThickness });
//   } catch (error) {
//     res.status(500).json({ message: (error as Error).message });
//   }
// },
// getactiveThickness: async (req: Request, res: Response): Promise<void> => {
//   try {
//     // Fetch all colors that are inactive
//     const activeThickness = await ColorModel.find({ active: true });

//     res.status(200).json({ activeThickness });
//   } catch (error) {
//     res.status(500).json({ message: (error as Error).message });
//   }
// },

getColors: async (req: Request, res: Response): Promise<void> => {
  try {
    // Fetch all colors that are active
    const color = await ColorModel.find();

    res.status(200).json({ color });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
},

getInactiveColors: async (req: Request, res: Response): Promise<void> => {
  try {
    // Fetch all colors that are inactive
    const inactiveColors = await ColorModel.find({ active: false });

    res.status(200).json({ inactiveColors });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
},
getactiveColors: async (req: Request, res: Response): Promise<void> => {
  try {
    // Fetch all colors that are inactive
    const activeColors = await ColorModel.find({ active: true });

    res.status(200).json({ activeColors });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
},

getSizes: async (req: Request, res: Response): Promise<void> => {
  try {
    // Fetch all sizes that are active
    const Sizes = await SizeModel.find();

    res.status(200).json({ Sizes });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
},

getInactiveSizes: async (req: Request, res: Response): Promise<void> => {
  try {
    // Fetch all sizes that are inactive
    const inactiveSizes = await SizeModel.find({ active: false });

    res.status(200).json({ inactiveSizes });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
},
getactiveSizes: async (req: Request, res: Response): Promise<void> => {
  try {
    // Fetch all sizes that are inactive
    const activeSizes = await SizeModel.find({ active: true });

    res.status(200).json({ activeSizes });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
},


// updateColor: async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { colorId, active } = req.body;  // colorId to identify the color, and active to set the status

//     if (typeof active !== "boolean") {
//       res.status(400).json({ message: "Active field must be a boolean." });
//       return;
//     }

//     // Find the color by its ID and update the active status
//     const updatedColor = await ColorModel.findByIdAndUpdate(
//       colorId,
//       { active },  // Update the active status
//       { new: true }  // Return the updated document
//     );

//     if (!updatedColor) {
//       res.status(404).json({ message: "Color not found." });
//       return;
//     }

//     res.status(200).json(updatedColor);  // Return the updated color
//   } catch (error) {
//     res.status(500).json({ message: (error as Error).message });
//   }
// },

updateColor: async (req: Request, res: Response): Promise<void> => {
  try {
    const { colorId, active } = req.body; // colorId to identify the color, and active to set the status

    // 1. Check if colorId is provided and is a valid ObjectId
    if (!colorId || !mongoose.Types.ObjectId.isValid(colorId)) {
       res.status(400).json({ message: "Invalid or missing colorId format." });
       return
    }

    // 2. Check if active is provided and is a boolean
    if (typeof active !== "boolean") {
       res.status(400).json({ message: "Active field must be a boolean." });
       return
    }

    // 3. Find the color by its ID and update the active status
    const updatedColor = await ColorModel.findByIdAndUpdate(
      colorId,
      { active },  // Update the active status
      { new: true }  // Return the updated document
    );

    // 4. Handle case when color is not found
    if (!updatedColor) {
       res.status(404).json({ message: "Color not found." });
       return
    }

    // 5. Return the updated color
    res.status(200).json({
      message: "Color updated successfully.",
      color: updatedColor,
    });
  } catch (error) {
    console.error("Error updating color:", error);
    res.status(500).json({ message: (error as Error).message });
  }
},

updateColorb: async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;  // Get the size ID from the URL
    const { colorName,colorCode, active } = req.body;  // Get the new size value and active status from the body
    // "colorName": "Red13",
    // "colorCode": "#CE3427",
    // Validate if size is provided
    if (!colorName || ! colorCode) {
       res.status(400).json({ message: "color name and color code Required" })
       return;
    }

    // Find the size by ID
    const existingcolor = await ColorModel.findById(id);
    if (!existingcolor) {
       res.status(404).json({ message: "color not found" });
       return
    }

    // Check if the new size already exists
    const colorExists = await ColorModel.findOne({ colorName,colorCode });
    if (colorExists) {
       res.status(400).json({ message: "colorName or ColorCode already exists" });
       return
    }

    // If 'active' is provided, ensure it's a boolean, otherwise leave the default value
    if (active !== undefined && typeof active !== "boolean") {
       res.status(400).json({ message: "Active field must be a boolean." });
       return
    }

    // Update the size and active field (if provided)
    existingcolor.colorCode = colorCode;
    if (active !== undefined) {
      existingcolor.active = active;  // Update active field if provided
    }
    existingcolor.colorName = colorName;
    if (active !== undefined) {
      existingcolor.active = active;  // Update active field if provided
    }

    // Save the updated size
    await existingcolor.save();

    res.status(200).json({
      message: "color updated successfully",
      size: existingcolor,
    });
  } catch (error: any) {
    console.error("Error updating size:", error);
    res.status(500).json({ message: "Error updating size.", error });
  }
},

// deleteThickness: async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { thicknessId } = req.params; // Get the thicknessId from the URL params

//     // Check if the thicknessId is a valid ObjectId
//     if (!mongoose.Types.ObjectId.isValid(thicknessId)) {
//       res.status(400).json({ message: "Invalid thicknessId format." });
//       return;
//     }

//     // Find the thickness by ID and delete it
//     const deletedThickness = await ThicknessModel.findByIdAndDelete(thicknessId);

//     if (!deletedThickness) {
//       res.status(404).json({ message: "Thickness not found." });
//       return;
//     }

//     res.status(200).json({ message: "Thickness deleted successfully." });  // Return success message
//   } catch (error) {
//     console.error("Error deleting thickness:", error);
//     res.status(500).json({ message: (error as Error).message });
//   }
// },


deleteColor :async (req: Request, res: Response): Promise<void> => {
  try {
    const { colorId } = req.params;  // Get the colorId from the URL params

    // Check if the colorId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(colorId)) {
      res.status(400).json({ message: "Invalid Color format." });
      return;
    }

    // Find the color by ID and delete it
    const deletedColor = await ColorModel.findByIdAndDelete(colorId);

    if (!deletedColor) {
      res.status(404).json({ message: "Color not found." });
      return;
    }

    res.status(200).json({ message: "Color deleted successfully." });  // Return success message
  } catch (error) {
    console.error("Error deleting color:", error);
    res.status(500).json({ message: (error as Error).message });
  }
},


deleteSize :async (req: Request, res: Response): Promise<void> => {
  try {
    const { sizeId } = req.params;  // Get the sizeId from the URL params

    // Check if the sizeId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(sizeId)) {
      res.status(400).json({ message: "Invalid sizeId format." });
      return;
    }

    // Find the size by ID and delete it
    const deletedSize = await SizeModel.findByIdAndDelete(sizeId);

    if (!deletedSize) {
      res.status(404).json({ message: "Size not found." });
      return;
    }

    res.status(200).json({ message: "Size deleted successfully." });  // Return success message
  } catch (error) {
    console.error("Error deleting size:", error);
    res.status(500).json({ message: (error as Error).message });
  }
},

  
  // // update the product attribute
  //   update: async (req: Request, res: Response): Promise<void> => {
  //       try {
  //       const { color, size, thickness, quantity } = req.body;
  //       const { id } = req.params;
    
  //       // Find the product attribute by ID and update it
  //       const updatedProductAttribute = await ProductAttributeModel.findByIdAndUpdate(
  //           id,
  //           { color, size, thickness, quantity },
  //           { new: true }
  //       );
    
  //       res.status(200).json(updatedProductAttribute); // Return the updated product attribute
  //       } catch (error) {
  //       res.status(500).json({ message: (error as Error).message }); // Handle errors
  //       }
  //   },
  //   // delete the product attribute
  //   delete: async (req: Request, res: Response): Promise<void> => {
  //       try {
  //       const { id } = req.params;
    
  //       // Find the product attribute by ID and delete it
  //       await ProductAttributeModel.findByIdAndDelete(id);
    
  //       res.status(204).end; // Return 204 No Content
  //       } catch (error) {
  //       res.status(500).json({ message: (error as Error).message }); // Handle errors
  //       }
  //   },

  // // API to fetch all product attributes
  // getAll: async (req: Request, res: Response): Promise<void> => {
  //   try {
  //     const attributes = await ProductAttributeModel.find(); // Fetch all product attributes
  //     res.status(200).json(attributes); // Return all product attributes
  //   } catch (error) {
  //     res.status(500).json({ message: (error as Error).message }); // Handle errors
  //   }
  // },
  

  
};

