import { Schema, model } from 'mongoose';

interface ICategory {
  name: string;
  image: string;
}

const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true },
  image: { type: String, required: true },
});

const CategoryModel = model<ICategory>('Category', categorySchema);

export default CategoryModel;
