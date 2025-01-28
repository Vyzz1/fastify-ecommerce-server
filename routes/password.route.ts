import { FastifyPluginAsync } from "fastify";
import passwordRestController from "../controllers/password-rest.controller";
import { commonResponseSchema } from "../schemas";

const passwordRouter: FastifyPluginAsync = async (fastify, opts) => {
  fastify.post(
    "/forgot",

    {
      handler: passwordRestController.handleSendOTP,
      schema: {
        body: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", format: "email" },
          },
        },
        ...commonResponseSchema({ token: { type: "string" } }),
      },
    }
  );

  fastify.post(
    "/validate",

    {
      handler: passwordRestController.handleValidateOTP,
      schema: {
        body: {
          type: "object",
          required: ["token", "otp"],
          properties: {
            token: { type: "string" },
            otp: { type: "string" },
          },
        },
        ...commonResponseSchema({ token: { type: "string" } }),
      },
    }
  );
  fastify.post("/reset", {
    handler: passwordRestController.handleResetPassword,
    schema: {
      body: {
        type: "object",
        required: ["token", "password"],
        properties: {
          token: { type: "string" },
          password: { type: "string" },
        },
      },
      ...commonResponseSchema({ message: { type: "string" } }),
    },
  });
};

export default passwordRouter;
