import { brewBlankExpressFunc } from "code-alchemy";
import fs from "fs";
import path from "path";
import { storageFolderPath } from "../constants";
import { getAzureBlobClient } from "../utils/azure-storage";

export default brewBlankExpressFunc(async (req, res) => {
  const { namespace, filename } = req.params;
  const location = req.query.location || "local";
  if (location == "azure") {
    const blobServiceClient = getAzureBlobClient();
    const containerClient = blobServiceClient.getContainerClient(namespace);
    const blockBlobClient = containerClient.getBlockBlobClient(filename);
    await blockBlobClient.delete();
  } else {
    fs.unlinkSync(path.join(storageFolderPath, namespace, filename));
  }
  res.json({
    code: 204,
    message: "File deleted successfully.",
  });
});
