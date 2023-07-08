import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import { AZURE_STORAGE_CONNECTION } from "../constants";

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
