import AWS from "aws-sdk";
import {
  AWS_ACCESS_KEY_ID,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
} from "../constants";

// Initialize S3 client
let s3: AWS.S3 = null;

export function initS3() {
  if (!s3) {
    s3 = new AWS.S3({
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
      region: AWS_REGION,
    });
  }
}

export function getS3() {
  initS3();
  return s3;
}
