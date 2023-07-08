import { brewBlankExpressFunc, throwErrorResponse } from "code-alchemy";
import path from "path";
import { DEFAULT_EXPIRES_IN, storageFolderPath } from "../../../constants";
import fs from "fs";
import verifyToken from "../../../utils/verify-token";
import generateToken from "../../../utils/generate-token";
import streamToBuffer from "../../../utils/stream-to-buffer";
import saveFile from "../../../utils/save-file";

export default brewBlankExpressFunc(async (req, res) => {
  const filename = req.headers["x-filename"] as string; // The filename could be sent in a header
  const namespace = req.headers["x-namespace"] as string; // The namespace could be sent in a header
  const location = (req.headers["x-location"] as string) || "local";

  const { namespacePermissions } = verifyToken(req);
  if (
    !namespacePermissions[namespace] ||
    !namespacePermissions[namespace].includes("w")
  ) {
    throwErrorResponse(401, "Unauthorized access to namespace");
  }

  if (location == "local") {
    const namespacePath = path.join(storageFolderPath, namespace);
    if (!fs.existsSync(namespacePath)) {
      fs.mkdirSync(namespacePath, { recursive: true });
    }

    const savePath = path.join(namespacePath, filename);

    // Create a write stream and pipe the request into it
    const writeStream = fs.createWriteStream(savePath);
    req.pipe(writeStream);

    const token = generateToken(
      location,
      namespace,
      filename,
      "r",
      parseInt(DEFAULT_EXPIRES_IN)
    );

    // When the stream is finished, send a response
    writeStream.on("finish", () => {
      res.json({
        code: 200,
        message: "File saved successfully.",
        url: `/quickstream/files/${namespace}/${filename}?t=${token}`,
      });
    });
  } else {
    const buffer = Buffer.concat(await streamToBuffer(req));
    const result = await saveFile({
      location,
      namespace,
      filename,
      buffer,
    });

    if (location == "azure") {
      res.json({
        code: 200,
        message: `File uploaded to Azure Blob storage at ${result.url}`,
        url: result.url,
      });
    } else {
      res.json({
        code: 200,
        message: `File uploaded to AWS S3 at ${result.url}`,
        url: result.url,
      });
    }
  }
});
