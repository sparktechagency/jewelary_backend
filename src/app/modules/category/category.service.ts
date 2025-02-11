import CategoryModel from "../../models/Category";

export const CategoryService = {
  create: async (data: { name: string; receipts: string }) => {
    try {
      const existingCategory = await CategoryModel.findOne({ name: data.name });
      if (existingCategory) throw new Error("Category already exists.");

      const category = new CategoryModel(data);
      await category.save();
      return category;
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
