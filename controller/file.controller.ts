import { RouteHandler } from "fastify";
import multer from "fastify-multer";
import s3Client from "../utils/s3Client";
import { Multipart, MultipartFile } from "@fastify/multipart";

const storage = multer.memoryStorage();
const myMulter = multer({ storage });

// Middleware function to handle single or multiple uploads
const upload = (fileName: string, type: "single" | "multiple") => {
  if (type === "single") {
    return myMulter.single(fileName);
  } else if (type === "multiple") {
    return myMulter.array(fileName);
  }
};

// S3 File Upload Handler
const handleUploadToS3: RouteHandler = async (req, reply) => {
  try {
    // Check if the file exists

    if (!req.file) {
      reply.status(400).send({ message: "No file uploaded" });
      return;
    }

    // Log the uploaded file(s)
    // console.log("File:", req.file);
    let file = req.file as unknown as FileUpload;

    const res = await uploadFileAndGetResponse(file);

    // console.log("Response:", res);

    reply.send(res);
  } catch (error) {
    console.error("Error uploading file:", error);
    reply.status(500).send({ message: "File upload failed" });
  }
};
const generateFileName = (fileName: string): string => {
  return `${Date.now()}-${fileName.replace(/\s/g, "-")}`;
};

const handleUploadMultipleToS3: RouteHandler = async (req, reply) => {
  try {
    const files = req.files as unknown as FileUpload[];

    if (!files || files.length === 0) {
      reply.status(400).send({ message: "No files uploaded" });
      return;
    }

    const responses = await Promise.all(
      files.map((file) => uploadFileAndGetResponse(file))
    );

    reply.send(responses);
  } catch (error) {
    throw new Error("Error uploading files");
  }
};

const uploadFileAndGetResponse = async (file: FileUpload) => {
  try {
    const fileName = generateFileName(file.originalname);

    await s3Client.uploadToS3(file.buffer, fileName, file.mimetype);

    const response = {
      fileName: file.originalname,
      uploadName: fileName,
      size: file.size,
      uploadTime: new Date().toISOString(),
      publicUrl: s3Client.generatePublicUrl(fileName),
    };

    return response;
  } catch (error) {
    throw new Error("Error uploading file");
  }
};

export default {
  upload,
  handleUploadToS3,
  handleUploadMultipleToS3,
};
