import { FastifyPluginAsync } from "fastify";
import { brandSchema } from "../schemas";
import ProductParentsController from "../controllers/product-parent.controller";
import Brand from "../models/brand.model";
import auth from "../utils/auth";
const brandRouter: FastifyPluginAsync = async (fastify) => {
  // GET /brands - Get all brands

  const controller = new ProductParentsController(Brand);

  fastify.get(
    "/",
    {
      schema: {
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: brandSchema,
            },
          },
          "4xx": {
            $ref: "ErrorResponse#",
          },
        },
      },
    },
    controller.handleGetAll
  );

  // POST /brands - Create a new brand
  fastify.post<{ Body: ProductParents }>(
    "/",
    {
      ...auth.requiredRole(fastify, "ROLE_ADMIN"),
      schema: {
        body: {
          type: "object",
          required: ["name"],
          properties: brandSchema,
        },
        response: {
          201: {
            type: "object",
            properties: brandSchema,
          },
          "4xx": {
            $ref: "ErrorResponse#",
          },
        },
      },
    },
    controller.handleCreate
  );

  // PUT /brands/:id - Update an existing brand
  fastify.put<{
    Params: { id: string };
    Body: ProductParents;
  }>(
    "/:id",
    {
      ...auth.requiredRole(fastify, "ROLE_ADMIN"),
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
          required: ["name"],
          properties: brandSchema,
        },
        response: {
          200: {
            type: "object",
            properties: brandSchema,
          },
          "4xx": {
            $ref: "ErrorResponse#",
          },
        },
      },
    },
    controller.handleUpdate
  );

  // DELETE /brands/:id - Delete a brand
  fastify.delete<{ Params: { id: string } }>(
    "/:id",
    {
      ...auth.requiredRole(fastify, "ROLE_ADMIN"),
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
          "4xx": {
            $ref: "ErrorResponse#",
          },
        },
      },
    },
    controller.handleDelete
  );

  // GET /brands/:id - Get a brand by ID
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
            properties: brandSchema,
          },
          "4xx": {
            $ref: "ErrorResponse#",
          },
        },
      },
    },
    controller.handleGetById
  );
};

export default brandRouter;
