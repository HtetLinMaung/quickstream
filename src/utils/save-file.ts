import { log } from "starless-logger";
import { getAzureBlobClient } from "./azure-storage";
import generateToken from "./generate-token";
import { DEFAULT_EXPIRES_IN, storageFolderPath } from "../constants";
import { getS3 } from "./s3";
import path from "path";
import fs from "fs";
import mime from "mime";

export interface SaveFileOptions {
  location?: string;
  namespace: string;
  filename: string;
  buffer: Buffer;
}

export default async function saveFile(options: SaveFileOptions): Promise<{
  url: string;
  data: any;
}> {
  const location = options.location || "local";
  const { namespace, filename, buffer } = options;

  let token = null;
  if (location === "azure") {
    // Get the file extension
    const fileExtension = path.extname(filename).slice(1);

    // Lookup the MIME type for the file extension
    const contentType = mime.lookup(fileExtension);
    const blobServiceClient = getAzureBlobClient();
    const containerClient = blobServiceClient.getContainerClient(namespace);

    // Define options for blob upload
    const uploadOptions = {
      blobHTTPHeaders: {
        blobContentType: contentType,
      },
    };

    // Upload to Azure Blob Storage
    const blockBlobClient = containerClient.getBlockBlobClient(filename);
    const uploadBlobResponse = await blockBlobClient.uploadData(
      buffer,
      uploadOptions
    );
    log(uploadBlobResponse);
    token = generateToken(
      location,
      namespace,
      filename,
      "r",
      parseInt(DEFAULT_EXPIRES_IN)
    );

    return {
      url: `${blockBlobClient.url}?${token}`,
      data: uploadBlobResponse,
    };
  } else if (location == "s3") {
    // Upload to AWS S3
    const uploadParams = {
      Bucket: namespace,
      Key: filename,
      Body: buffer,
    };
    const s3 = getS3();
    const data = await s3.upload(uploadParams).promise();
    return {
      url: data.Location,
      data,
    };
  } else {
    const namespacePath = path.join(storageFolderPath, namespace);
    if (!fs.existsSync(namespacePath)) {
      fs.mkdirSync(namespacePath);
    }
    const savePath = path.join(namespacePath, filename);
    // write the file to the filesystem
    return new Promise((resolve, reject) => {
      fs.writeFile(savePath, buffer, (err) => {
        if (err) {
          reject(err);
        }
        token = generateToken(
          location,
          namespace,
          filename,
          "r",
          DEFAULT_EXPIRES_IN
        );
        resolve({
          url: `/quickstream/files/${namespace}/${filename}?t=${token}`,
          data: null,
        });
      });
    });
  }
}
