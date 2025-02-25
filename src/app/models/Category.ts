// import { Schema, model } from 'mongoose';

// interface ICategory {
//   name: string;
//   image: string;
//   active: boolean;
// }

// const categorySchema = new Schema<ICategory>({
//   name: { type: String, required: true },
//   image: { type: String, required: true },
//   active: { type: Boolean, default: true },
// });

// const CategoryModel = model<ICategory>('Category', categorySchema);

// export default CategoryModel;

import { Schema, model } from 'mongoose';

interface ICategory {
  name: string;
  image: string;
  active: boolean;
}

const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true },
  image: { type: String, required: true },
  active: { type: Boolean, default: true },
});

const CategoryModel = model<ICategory>('Category', categorySchema);

export default CategoryModel;
