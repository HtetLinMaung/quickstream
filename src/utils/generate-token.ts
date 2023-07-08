import {
  BlobSASPermissions,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";
import jwt from "jsonwebtoken";
import { getAzureSharedKeyCredential } from "./azure-storage";
import { SECRET_KEY } from "../constants";

export default function generateToken(
  location: string,
  namespace: string,
  filename: string,
  permissions: string,
  expiresIn: string | number
) {
  if (location == "azure") {
    return generateBlobSASQueryParameters(
      {
        containerName: namespace,
        blobName: filename,
        permissions: BlobSASPermissions.parse(permissions || "r"), // "r" for read
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + (expiresIn as number)), // Link valid for 24 hours
      },
      getAzureSharedKeyCredential()
    ).toString();
  } else {
    return jwt.sign({ namespace, permissions, filename }, SECRET_KEY, {
      expiresIn,
    });
  }
}
