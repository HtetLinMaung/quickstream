import { brewBlankExpressFunc, throwErrorResponse } from "code-alchemy";
import { storageFolderPath } from "../constants";
import fs from "fs";
import path from "path";
import mime from "mime";
import { getAzureBlobClient } from "../utils/azure-storage";

export default brewBlankExpressFunc(async (req, res) => {
  const { namespace, filename } = req.params;

  const namespacePath = path.join(storageFolderPath, namespace);
  const filePath = path.join(namespacePath, filename);

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      throwErrorResponse(
        416,
        "Requested range not satisfiable\n" + start + " >= " + fileSize
      );
    }

    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": mime.lookup(filename) as string,
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": mime.lookup(filename) as string,
    };

    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});
