import { FastifyPluginAsync } from "fastify";
import auth from "../utils/auth";
import shoppingCartController from "../controllers/shopping-cart.controller";
import { commonResponseSchema, requiredIdParam } from "../schemas";

const shoppingCartRouter: FastifyPluginAsync = async (fastify, opts) => {
  auth.authRequiredHook(fastify);

  fastify.post<{ Body: CartRequest }>("/", {
    handler: shoppingCartController.handleCreateShoppingCart,
    schema: {
      body: {
        type: "object",
        properties: {
          quantity: { type: "number" },
          productItemId: { type: "string" },
        },
        required: ["quantity", "productItemId"],
      },
    },
  });

  fastify.get("/", {
    handler: shoppingCartController.handleGetUserCart,
  });

  fastify.put("/quantity/:id", {
    handler: shoppingCartController.handleUpdateQuantity,
    schema: {
      ...requiredIdParam,
      body: {
        type: "object",
        properties: {
          quantity: { type: "number" },
        },
        required: ["quantity"],
      },
    },
  });

  fastify.delete<{ Params: { id: string } }>("/:id", {
    handler: shoppingCartController.handleDeleteCartItem,
    schema: {
      ...requiredIdParam,
      ...commonResponseSchema({ message: { type: "string" } }),
    },
  });
};

export default shoppingCartRouter;
