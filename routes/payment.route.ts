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
};

export default paymentRouter;
