import { FastifyPluginAsync } from "fastify";
import validateJwt from "../hooks/validateJwt";
import validateRole from "../hooks/validateRole";
import categoryController from "../controller/category.controller";
import { categorySchema } from "../schemas";
import auth from "../utils/auth";

const categoryRoute: FastifyPluginAsync = async (fastify) => {
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
    categoryController.handleGetCategories
  );

  fastify.post<{ Body: ProductParents }>(
    "/",
    {
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
    categoryController.handleCreateCategory
  );

  fastify.put<{ Params: { id: string }; Body: ProductParents }>(
    "/:id",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            image: { type: "string" },
          },
          required: ["name", "image"],
        },
        response: {
          200: {
            type: "object",
            properties: categorySchema,
          },
          "4xx": {
            $ref: "ErrorResponse#",
          },
        },
      },
    },
    categoryController.handleUpdateCategory
  );

  fastify.delete<{ Params: { id: string } }>(
    "/:id",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    categoryController.handleDeleteCategory
  );

  fastify.get<{ Params: { id: string } }>(
    "/:id",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: categorySchema,
          },
        },
      },
    },
    categoryController.handleGetCategoryById
  );
};

export default categoryRoute;
