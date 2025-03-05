import CategoryModel from "../../models/Category";
import ProductModel from "../../models/Product";

export const CategoryService = {

    create: async (data: { name: string; image: string; active: boolean }) => {
      try {
        // 🔍 Check if category already exists BEFORE saving the image
        const existingCategory = await CategoryModel.findOne({ name: data.name });
        if (existingCategory) {
          return { error: "Category already exists.", category: existingCategory };
        }
  
        // ✅ Save new category
        const category = new CategoryModel({ name: data.name, image: data.image , active: data.active });
        await category.save();
        return { message: "Category created successfully.", category };
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Error creating category");
      }
    },


  
  

  findAll: async () => {
    try {
      return await CategoryModel.find();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Error fetching categories");
    }
  },

  findById: async (id: string) => {
    try {
      return await CategoryModel.findById(id);
    } catch (error) {
      throw new Error("Category not found.");
    }
  },


  update: async (id: string, updateData: { active?: boolean; name?: string; image?: string }) => {
    try {
      // If no fields are provided, return null (handled in controller)
      if (Object.keys(updateData).length === 0) {
        return null;
      }

      // Perform the update and return the updated category
      const updatedCategory = await CategoryModel.findByIdAndUpdate(id, updateData, { new: true });

      // Return the updated category or null if not found
      return updatedCategory;
    } catch (error) {
      console.error("Error updating category:", error);
      throw new Error("Error updating category.");
    }
  },

  delete: async (id: string) => {
    try {
      return await CategoryModel.findByIdAndDelete(id);
    } catch (error) {
      throw new Error("Error deleting category.");
    }
  },
};
