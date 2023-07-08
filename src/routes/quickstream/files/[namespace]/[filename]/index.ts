import { brewBlankExpressFunc, throwErrorResponse } from "code-alchemy";
import path from "path";
import fs from "fs";
import { SECRET_KEY, storageFolderPath } from "../../../../../constants";
import jwt from "jsonwebtoken";
import { getAzureBlobClient } from "../../../../../utils/azure-storage";
import getFileHandler from "../../../../../handlers/get-file-handler";
import deleteFileHandler from "../../../../../handlers/delete-file-handler";

export default brewBlankExpressFunc(async (req, res) => {
  const method = req.method.toLowerCase();
  const { namespace, filename } = req.params;
  const location = req.query.location || "local";

  const token = req.query.t as string;
  try {
    const decoded: any = jwt.verify(token, SECRET_KEY);
    if (decoded.namespacePermissions) {
      if (
        !decoded.namespacePermissions[namespace] ||
        !decoded.namespacePermissions[namespace].includes(
          method == "delete" ? "d" : "r"
        )
      ) {
        throwErrorResponse(401, "Unauthorized access to namespace");
      }
    } else {
      if (
        decoded.filename != filename ||
        decoded.namespace != namespace ||
        !decoded.permissions.includes(method == "delete" ? "d" : "r")
      ) {
        return res.json({
          code: 404,
          message: "The specified resource does not exist.",
        });
      }
    }
  } catch (err) {
    throwErrorResponse(401, err.message);
  }

  if (location == "local") {
    const namespacePath = path.join(storageFolderPath, namespace);
    if (!fs.existsSync(namespacePath)) {
      throwErrorResponse(404, "Namespace not found!");
    }
    const filePath = path.join(namespacePath, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throwErrorResponse(404, "File not found!");
    }
  } else if (location == "azure" && method == "delete") {
    const blobServiceClient = getAzureBlobClient();
    const containerClient = blobServiceClient.getContainerClient(namespace);

    // Check if the container exists
    const containerExists = await containerClient.exists();
    if (!containerExists) {
      throwErrorResponse(404, `Container "${namespace}" does not exist`);
    }
    const blockBlobClient = containerClient.getBlockBlobClient(filename);

    // Check if the blob exists
    const blobExists = await blockBlobClient.exists();
    if (!blobExists) {
      throwErrorResponse(
        404,
        `Blob "${filename}" does not exist in container "${namespace}"`
      );
    }
  }
  if (method == "get") {
    await getFileHandler(req, res);
  } else if (method == "delete") {
    await deleteFileHandler(req, res);
  }
});
