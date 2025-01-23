import { FastifyPluginAsync } from "fastify";
import authController from "../controller/auth.controller";
import verifyJwt from "../hooks/validateJwt";
const authRouter: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: LoginRequest }>("/login", {
    handler: authController.loginController,
    schema: {
      body: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string" },
          password: { type: "string" },
        },
      },
      response: {
        "4xx": { $ref: "ErrorResponse#" },
        200: {
          type: "object",
          properties: {
            _id: { type: "string" },
            email: { type: "string" },
            name: { type: "string" },
            role: { type: "string" },
            dob: { type: "string" },
            photoUrl: { type: "string" },
            token: { type: "string" },
          },
        },
      },
    },
  });

  fastify.post<{ Body: User }>("/register", {
    handler: authController.registerController,
    schema: {
      body: {
        type: "object",
        required: ["email", "password", "firstName", "lastName"],
        properties: {
          email: { type: "string" },
          password: { type: "string" },
          firstName: { type: "string" },
          lastName: { type: "string" },
        },
      },
      response: {
        201: { $ref: "User#" },
        "4xx": { $ref: "ErrorResponse#" },
      },
    },
  });

  fastify.get("/refresh", {
    handler: authController.refreshController,
    schema: {
      response: {
        200: {
          type: "object",
          properties: {
            accessToken: { type: "string" },
          },
        },
        "4xx": { $ref: "ErrorResponse#" },
      },
    },
  });

  fastify.get("/logout", {
    handler: authController.logoutController,
    schema: {
      response: {
        200: { $ref: "CommonMessage#" },
      },
    },
  });

  fastify.get("/", {
    preHandler: fastify.auth([verifyJwt]),
    handler: authController.getUserInformation,
    schema: {
      response: {
        200: { $ref: "User#" },
        "4xx": { $ref: "ErrorResponse#" },
      },
    },
  });

  fastify.put<{ Body: { avatar: string } }>("/avatar", {
    preHandler: fastify.auth([verifyJwt]),
    handler: authController.updateAvatar,
    schema: {
      response: {
        200: { $ref: "CommonMessage#" },
        "4xx": { $ref: "ErrorResponse#" },
      },
    },
  });

  fastify.put<{ Body: ChangePasswordRequest }>(
    "/change-password",
    {
      preHandler: fastify.auth([verifyJwt]),
      schema: {
        body: {
          type: "object",
          required: ["password"],
          properties: {
            password: { type: "string" },
          },
        },
        response: {
          200: { $ref: "CommonMessage#" },
          "4xx": { $ref: "ErrorResponse#" },
        },
      },
    },
    authController.updatePassword
  );
};

export default authRouter;
