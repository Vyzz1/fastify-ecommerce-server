import { FastifyPluginAsync } from "fastify";
import ProductVariantController from "../controllers/product-variant.controller";
import {
  commonResponseSchema,
  errorResponse,
  productVariantSchema,
} from "../schemas";
import ProductSize from "../models/product-size.model";
import auth from "../utils/auth";

const ProductSizeRouter: FastifyPluginAsync = async (fastify) => {
  const controller = new ProductVariantController(ProductSize);

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
    ...auth.requiredRole(fastify, "ROLE_ADMIN"),

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
    ...auth.requiredRole(fastify, "ROLE_ADMIN"),

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
    ...auth.requiredRole(fastify, "ROLE_ADMIN"),

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

export default ProductSizeRouter;
