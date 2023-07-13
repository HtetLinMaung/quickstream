import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import { AZURE_STORAGE_CONNECTION } from "../constants";
import path from "path";
import mime from "mime";
import { log } from "starless-logger";

let blobServiceClient: BlobServiceClient = null;

export function initAzureBlobClient() {
  if (!blobServiceClient) {
    // Initialize BlobServiceClient
    blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION
    );
  }
}

export function getAzureBlobClient() {
  initAzureBlobClient();
  return blobServiceClient;
}

export function getAzureSharedKeyCredential() {
  const storageAccountName =
    AZURE_STORAGE_CONNECTION.match(/AccountName=(.*?);/)[1];
  const storageAccountKey =
    AZURE_STORAGE_CONNECTION.match(/AccountKey=(.*?);/)[1];
  return new StorageSharedKeyCredential(storageAccountName, storageAccountKey);
}

export interface UploadBlobOptions {
  blobName: string;
  containerName: string;
  buffer: Buffer;
}

export async function uploadBlob(options: UploadBlobOptions) {
  const { blobName, containerName, buffer } = options;
  // Get the file extension
  const fileExtension = path.extname(blobName).slice(1);

  // Lookup the MIME type for the file extension
  const contentType = mime.lookup(fileExtension);
  const blobServiceClient = getAzureBlobClient();
  const containerClient = blobServiceClient.getContainerClient(containerName);

  // Define options for blob upload
  const uploadOptions = {
    blobHTTPHeaders: {
      blobContentType: contentType,
    },
  };

  // Upload to Azure Blob Storage
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const uploadBlobResponse = await blockBlobClient.uploadData(
    buffer,
    uploadOptions
  );
  log(uploadBlobResponse);
  return uploadBlobResponse;
}
