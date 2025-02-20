import { Request, Response } from "express";
import LegalDocument from "../../models/legalDocument.model";


// ✅ Create or Update a Legal Document
export const createOrUpdateDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("Received Body:", req.body); // ✅ Debugging step
  
      const { title, sections } = req.body;
  
      if (!title || !sections) {
         res.status(400).json({ error: "Title and sections are required." });
         return
      }
  
      let document = await LegalDocument.findOne({ title });
  
      if (document) {
        document.sections = sections;
        await document.save();
      } else {
        document = await LegalDocument.create({ title, sections });
      }
  
      res.status(200).json(document);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
  

// ✅ Get All Legal Documents
// export const getAllDocuments = async (req: Request, res: Response): Promise<void> => {
//     try {
//       console.log("Received request:", req.method, req.url);
//       console.log("Query params:", req.query);
  
//       const documents = await LegalDocument.find();
//       res.status(200).json(documents);
//     } catch (error) {
//       console.error("Error fetching documents:", error);
//       res.status(500).json({ error: (error as Error).message });
//     }
//   };  

export const getAllDocuments = async (req: Request, res: Response): Promise<void> => {
    try {
        const documents = await LegalDocument.find();

        // Format response with HTML-like structure
        const formattedDocuments = documents.map((doc) => ({
            _id: doc._id,
            title: `<p>${doc.title}</p>`,
            sections: doc.sections.map((section: any) => ({
                heading: `<p><strong>${section.heading}</strong></p>`,
                content: `<p>${section.content}</p>`
            }))
        }));

        res.status(200).json({
            success: true,
            message: "Legal documents retrieved successfully",
            data: formattedDocuments
        });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

  
  

// ✅ Get a Single Legal Document by Title
export const getDocumentByTitle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title } = req.params;
    const document = await LegalDocument.findOne({ title });

    if (!document) {
      res.status(404).json({ message: "Document not found" });
      return;
    }

    res.status(200).json(document);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// ✅ Delete a Legal Document
export const deleteDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title } = req.params;
    await LegalDocument.deleteOne({ title });

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
