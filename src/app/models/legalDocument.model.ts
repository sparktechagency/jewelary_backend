import mongoose, { Schema, Document } from "mongoose";

// Define the interface for a section
interface ISection {
  heading: string;
  content: string;
}

// Define the interface for Legal Document
export interface ILegalDocument extends Document {
  title: string;
  sections: ISection[];
}

// Mongoose Schema
const LegalDocumentSchema = new Schema<ILegalDocument>(
  {
    title: { type: String, required: true },
    sections: [
      {
        heading: { type: String, required: true },
        content: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<ILegalDocument>(
  "LegalDocument",
  LegalDocumentSchema
);
