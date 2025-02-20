import express from "express";
import {
  createOrUpdateDocument,
  getAllDocuments,
  getDocumentByTitle,
  deleteDocument,
} from "./legalDocument.controller";
import { isAdmin, isAuthenticated } from "../auth/auth.middleware";


const legalDocumentRoute = express.Router();

// ✅ Correct Middleware Usage
legalDocumentRoute.post("/",isAuthenticated,createOrUpdateDocument);
legalDocumentRoute.get("/", getAllDocuments);
legalDocumentRoute.get("/:title", getDocumentByTitle);
legalDocumentRoute.delete("/:title", deleteDocument);

export default legalDocumentRoute;
