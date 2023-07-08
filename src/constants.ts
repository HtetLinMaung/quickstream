import multer from "multer";
import path from "path";

export const storageFolderPath = path.join(__dirname, "storage");

export const upload = multer();

export const API_KEY = process.env.API_KEY;
export const SECRET_KEY = process.env.SECRET_KEY;
export const DEFAULT_EXPIRES_IN = process.env.DEFAULT_EXPIRES_IN;

export const AZURE_STORAGE_CONNECTION = process.env.AZURE_STORAGE_CONNECTION;

export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
export const AWS_REGION = process.env.AWS_REGION;
