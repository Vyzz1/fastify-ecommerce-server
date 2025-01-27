import { FastifyPluginAsync } from "fastify";
import auth from "../utils/auth";
import productItemController from "../controllers/product-item.controller";
import { errorResponse, requiredIdParam } from "../schemas";

const productItemRouter: FastifyPluginAsync = async (fastify, opts) => {
  // auth.roleRequiredHook(fastify, "admin");

  fastify.post("/:productId", {
    handler: productItemController.createProductItem,
    schema: {
      params: {
        type: "object",
        properties: {
          id: { type: "string" },
        },
        required: ["productId"],
      },
      body: {
        type: "object",
        properties: {
          productSizeId: { type: "string" },
          quantity: { type: "number" },
        },
        required: ["productSizeId", "quantity"],
      },
      response: {
        ...errorResponse,
      },
    },
  });

  fastify.delete("/:id", {
    handler: productItemController.deleteOneProductItem,
    schema: {
      ...requiredIdParam,
      response: {
        ...errorResponse,
      },
    },
  });

  fastify.get("/:id", {
    handler: productItemController.findProductItemById,
    schema: {
      ...requiredIdParam,
      response: {
        ...errorResponse,
      },
    },
  });

  fastify.put("/:id", {
    handler: productItemController.updateProductItem,
    schema: {
      ...requiredIdParam,
      body: {
        type: "object",
        properties: {
          productSizeId: { type: "string" },
          quantity: { type: "number" },
        },
        required: ["productSizeId", "quantity"],
      },
      response: {
        ...errorResponse,
      },
    },
  });

  fastify.get("/config/:id", {
    handler: productItemController.handleGetConfig,
    schema: {
      ...requiredIdParam,
      response: {
        ...errorResponse,
      },
    },
  });
};

export default productItemRouter;
