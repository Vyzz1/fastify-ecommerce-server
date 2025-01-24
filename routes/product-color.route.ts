import { FastifyPluginAsync } from "fastify";
import ProductVariantController from "../controllers/product-variant.controller";
import ProductColor from "../models/product-color.model";
import {
  commonResponseSchema,
  errorResponse,
  productVariantSchema,
} from "../schemas";

const ProductColorRouter: FastifyPluginAsync = async (fastify) => {
  const controller = new ProductVariantController(ProductColor);

  fastify.get("/", {
    handler: controller.handleGetAll,
    schema: {
      response: {
        "2xx": {
          type: "array",
          items: {
            type: "object",
            properties: productVariantSchema,
          },
        },
        ...errorResponse,
      },
    },
  });

  fastify.get("/:id", {
    handler: controller.handleGetById,
    schema: {
      ...commonResponseSchema(productVariantSchema),
    },
  });

  fastify.post<{ Body: ProductVariants }>("/", {
    handler: controller.handleCreate,
    schema: {
      body: {
        required: ["value"],
        type: "object",
        properties: productVariantSchema,
      },

      ...commonResponseSchema(productVariantSchema, 201),
    },
  });

  fastify.put<{ Params: { id: string }; Body: ProductVariants }>("/:id", {
    handler: controller.handleUpdate,
    schema: {
      params: {
        type: "object",
        properties: {
          id: { type: "string" },
        },
      },
      body: {
        required: ["value"],
        type: "object",
        properties: productVariantSchema,
      },

      ...commonResponseSchema(productVariantSchema),
    },
  });

  fastify.delete<{ Params: { id: string } }>("/:id", {
    handler: controller.handleDelete,
    schema: {
      params: {
        type: "object",
        properties: {
          id: { type: "string" },
        },
        required: ["id"],
      },

      ...commonResponseSchema({ message: { type: "string" } }),
    },
  });
};

export default ProductColorRouter;
