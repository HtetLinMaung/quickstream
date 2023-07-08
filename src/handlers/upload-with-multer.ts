import { brewBlankExpressFunc, throwErrorResponse } from "code-alchemy";
import saveFile from "../utils/save-file";

export default brewBlankExpressFunc(async (req, res) => {
  const { namespace, location } = req.body;
  const { originalname, buffer } = req.file;
  const uploadLocation = location || "local";
  const { namespacePermissions } = req as any;

  if (
    !namespacePermissions[namespace] ||
    !namespacePermissions[namespace].includes("w")
  ) {
    throwErrorResponse(401, "Unauthorized access to namespace");
  }

  const result = await saveFile({
    location: uploadLocation,
    namespace,
    filename: originalname,
    buffer,
  });
  if (uploadLocation === "azure") {
    res.json({
      code: 200,
      message: `File uploaded to Azure Blob storage at ${result.url}`,
      url: result.url,
    });
  } else if (uploadLocation == "s3") {
    res.json({
      code: 200,
      message: `File uploaded to AWS S3 at ${result.url}`,
      url: result.url,
    });
  } else {
    res.json({
      code: 200,
      message: "File saved successfully.",
      url: result.url,
    });
  }
});
