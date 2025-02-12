import CategoryModel from "../../models/Category";

export const CategoryService = {

    create: async (data: { name: string; image: string }) => {
      try {
        // 🔍 Check if category already exists BEFORE saving the image
        const existingCategory = await CategoryModel.findOne({ name: data.name });
        if (existingCategory) {
          return { error: "Category already exists.", category: existingCategory };
        }
  
        // ✅ Save new category
        const category = new CategoryModel({ name: data.name, image: data.image });
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

  update: async (id: string, updateData: { name?: string; receipts?: string }) => {
    try {
      return await CategoryModel.findByIdAndUpdate(id, updateData, { new: true });
    } catch (error) {
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
