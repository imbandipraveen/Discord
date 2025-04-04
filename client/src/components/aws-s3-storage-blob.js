import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { v4 } from "uuid";
import config from "../../config/config";

const bucketName = config.S3.BUCKET_NAME;
const region = config.S3.REGION;
const accessKeyId = config.S3.ACCESS_KEY;
const secretAccessKey = config.S3.SECRET_KEY;

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

// Check if S3 is configured
export const isStorageConfigured = () => {
  return bucketName && accessKeyId && secretAccessKey ? true : false;
};

// Upload file to S3
const uploadFileToS3 = async (file) => {
  if (!file) return "";

  const uniqueId = v4().replace("-", "");
  const fileName = `${uniqueId}-${Date.now()}-${file.name}`;

  // Convert file to Buffer
  const fileBuffer = await file.arrayBuffer(); // Converts File to ArrayBuffer
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: fileBuffer, // Using buffer instead of raw file
    ContentType: file.type,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    return `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`;
  } catch (error) {
    console.error("S3 Upload Error:", error);
    return "";
  }
};

// Get list of files from S3 bucket
const getFilesFromS3 = async () => {
  try {
    const command = new ListObjectsV2Command({ Bucket: bucketName });
    const response = await s3Client.send(command);
    return (
      response.Contents?.map(
        (item) => `https://${bucketName}.s3.${region}.amazonaws.com/${item.Key}`
      ) || []
    );
  } catch (error) {
    console.error("S3 List Error:", error);
    return [];
  }
};

export { uploadFileToS3, getFilesFromS3 };
