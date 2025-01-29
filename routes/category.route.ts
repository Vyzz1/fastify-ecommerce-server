import { FastifyPluginAsync } from "fastify";

import {
  categorySchema,
  commonResponseSchema,
  requiredIdParam,
} from "../schemas";
import ProductParentsController from "../controllers/product-parent.controller";
import Category from "../models/category.model";
import auth from "../utils/auth";
// import auth from "../utils/auth";

const categoryRoute: FastifyPluginAsync = async (fastify) => {
  const controller = new ProductParentsController(Category);

  fastify.get(
    "/",
    {
      schema: {
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: categorySchema,
            },
          },
        },
      },
    },
    controller.handleGetAll
  );

  fastify.post<{ Body: ProductParents }>(
    "/",
    {
      ...auth.requiredRole(fastify, "ROLE_ADMIN"),
      // ...auth.requiredRole(fastify, "admin"),
      schema: {
        body: {
          type: "object",
          required: ["name", "image"],
          properties: categorySchema,
        },
        response: {
          201: {
            type: "object",
            properties: categorySchema,
          },
        },
      },
    },
    controller.handleCreate
  );

  fastify.put<{ Params: { id: string }; Body: ProductParents }>(
    "/:id",
    {
      // ...auth.requiredRole(fastify, "admin"),
      ...auth.requiredRole(fastify, "ROLE_ADMIN"),

      schema: {
        ...requiredIdParam,
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            image: { type: "string" },
          },
          required: ["name", "image"],
        },

        ...commonResponseSchema(categorySchema),
      },
    },
    controller.handleUpdate
  );

  fastify.delete<{ Params: { id: string } }>(
    "/:id",
    {
      // ...auth.requiredRole(fastify, "admin"),
      ...auth.requiredRole(fastify, "ROLE_ADMIN"),

      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },

        ...commonResponseSchema(categorySchema, 204),
      },
    },
    controller.handleDelete
  );

  fastify.get<{ Params: { id: string } }>(
    "/:id",
    {
      // ...auth.requiredRole(fastify, "admin"),
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },

        ...commonResponseSchema(categorySchema),
      },
    },
    controller.handleGetById
  );
};

export default categoryRoute;
