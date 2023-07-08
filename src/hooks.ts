import fs from "fs";
import {
  AWS_ACCESS_KEY_ID,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
  AZURE_STORAGE_CONNECTION,
  storageFolderPath,
  upload,
} from "./constants";
import { initAzureBlobClient } from "./utils/azure-storage";
import { initS3 } from "./utils/s3";
import uploadWithMulter from "./handlers/upload-with-multer";
import verifyToken from "./utils/verify-token";
import { NextFunction, Request, Response } from "express";
import connectMongoose from "./utils/connect-mongoose";

export const afterWorkerStart = async () => {
  await connectMongoose();
  if (AZURE_STORAGE_CONNECTION) {
    initAzureBlobClient();
  } else if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY && AWS_REGION) {
    initS3();
  }
};

export const afterMasterProcessStart = async () => {
  if (!fs.existsSync(storageFolderPath)) {
    fs.mkdirSync(storageFolderPath);
  }
};

export const beforeServerStart = async (app: any) => {
  app.post(
    "/quickstream/upload",
    (req: Request, res: Response, next: NextFunction) => {
      try {
        const { namespacePermissions } = verifyToken(req);
        (req as any).namespacePermissions = namespacePermissions;
        next();
      } catch (err) {
        res.status(500).json({
          code: 500,
          message: err.message,
        });
      }
    },
    upload.single("file"),
    uploadWithMulter
  );
};
