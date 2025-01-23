import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const bucketName = process.env.aws_s3_bucketName;
const accessKeyId = process.env.aws_s3_accessKey;
const secretAccessKey = process.env.aws_s3_secretKey;
const region = process.env.aws_s3_bucket_region;

const s3Client = new S3Client({
  region: region ?? "",
  credentials: {
    accessKeyId: accessKeyId ?? "",
    secretAccessKey: secretAccessKey ?? "",
  },
});

const uploadToS3 = (fileBuffer: Buffer, fileName: string, mimeType: string) => {
  const params = {
    Bucket: bucketName,
    Body: fileBuffer,
    Key: fileName,
    ContentType: mimeType,
  };
  return s3Client.send(new PutObjectCommand({ ...params, ACL: "public-read" }));
};

const getFileFromS3 = async (fileName: string) => {
  try {
    // Define parameters for the GetObjectCommand
    const params = {
      Bucket: bucketName,
      Key: fileName,
    };

    // Fetch the object from S3
    const command = new GetObjectCommand(params);
    const data = await s3Client.send(command);

    return data;
  } catch (error) {
    console.error("Error fetching file from S3:", error);
    throw new Error("Error fetching file from S3");
  }
};
const generatePublicUrl = (fileName: string): string => {
  return `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`;
};

export default {
  uploadToS3,
  getFileFromS3,
  generatePublicUrl,
};
