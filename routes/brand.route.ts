import { FastifyPluginAsync } from "fastify";
import brandController from "../controller/brand.controller";
import { brandSchema } from "../schemas";

const brandRouter: FastifyPluginAsync = async (fastify) => {
  // GET /brands - Get all brands
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
    brandController.handleGetBrands
  );

  // POST /brands - Create a new brand
  fastify.post<{ Body: { name: string } }>(
    "/",
    {
      schema: {
        body: {
          type: "object",
          required: ["name", "image"],
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
    brandController.handleCreateBrand
  );

  // PUT /brands/:id - Update an existing brand
  fastify.put<{
    Params: { id: string };
    Body: { name: string };
  }>(
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
          required: ["name", "image"],
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
    brandController.handleUpdateBrand
  );

  // DELETE /brands/:id - Delete a brand
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
          "4xx": {
            $ref: "ErrorResponse#",
          },
        },
      },
    },
    brandController.handleDeleteBrand
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
    brandController.handleGetBrandById
  );
};

export default brandRouter;
