import { FastifyPluginAsync, RouteHandler } from "fastify";
import auth from "../utils/auth";
import paymentController from "../controllers/payment.controller";
import { commonResponseSchema } from "../schemas";

const paymentRouter: FastifyPluginAsync = async (fastify) => {
  fastify.post("/", {
    ...auth.requiredAuth(fastify),
    handler: paymentController.handleCreatePaymentIntent,
    schema: {
      body: {
        type: "object",
        properties: {
          request: {
            type: "array",
            items: {
              type: "object",
            },
          },
          total: { type: "number" },
        },
      },
      ...commonResponseSchema({ url: { type: "string", format: "uri" } }),
    },
  });

  fastify.post("/webhook", {
    handler: paymentController.handleWebhook,
    config: {
      rawBody: true,
    },
  });

  fastify.post("/repay", {
    ...auth.requiredAuth(fastify),
    handler: paymentController.handleRepay,
    schema: {
      body: {
        type: "object",
        properties: {
          referenceId: { type: "string" },
        },
        required: ["referenceId"],
      },
      ...commonResponseSchema({ url: { type: "string", format: "uri" } }),
    },
  });

  fastify.get("/", {
    ...auth.requiredRole(fastify, "ROLE_ADMIN"),
    handler: paymentController.handleGetAllPayments,
  });

  fastify.get("/user", {
    ...auth.requiredAuth(fastify),
    handler: paymentController.handleGetUserPayments,
  });
};

export default paymentRouter;
