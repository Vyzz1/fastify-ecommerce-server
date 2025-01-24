import { FastifyPluginAsync } from "fastify";
import auth from "../utils/auth";
import fileController from "../controllers/file.controller";
const fileRouter: FastifyPluginAsync = async (fastify) => {
  auth.authRequiredHook(fastify);

  fastify.post("/", {
    preHandler: fileController.upload("file", "single"),
    handler: fileController.handleUploadToS3,
  });

  fastify.post("/multiple", {
    preHandler: fileController.upload("files", "multiple"),
    handler: fileController.handleUploadMultipleToS3,
  });
};

export default fileRouter;
