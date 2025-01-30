import { FastifyPluginAsync } from "fastify";
import productController from "../controllers/product.controller";
import {
  commonResponseSchema,
  errorResponse,
  filteredProductSchema,
  productSchema,
  requiredIdParam,
} from "../schemas";
import auth from "../utils/auth";

const productRoutes: FastifyPluginAsync = async (fastify) => {
  // fastify.get("/",)

  fastify.post<{ Body: ProductRequest }>("/", {
    ...auth.requiredRole(fastify, "ROLE_ADMIN"),

    handler: productController.handleCreateProduct,
    schema: {
      body: {
        type: "object",
        required: [
          "name",
          "brandId",
          "categoryId",
          "productColorId",
          "price",
          "images",
        ],
      },
      response: {
        ...errorResponse,
      },
    },
  });

  fastify.put<{ Params: { id: string }; Body: ProductRequest }>("/:id", {
    ...auth.requiredRole(fastify, "ROLE_ADMIN"),

    handler: productController.handleUpdateProduct,
    schema: {
      ...requiredIdParam,
      ...commonResponseSchema(productSchema),
    },
  });

  fastify.get<{ Params: { id: string } }>("/:id", {
    handler: productController.handleGetProduct,
    schema: {
      ...requiredIdParam,
      ...commonResponseSchema(productSchema),
    },
  });

  fastify.get("/", {
    ...auth.requiredRole(fastify, "ROLE_ADMIN"),
    handler: productController.handleGetAllProducts,
    schema: {
      ...commonResponseSchema(
        {
          items: { type: "object", properties: productSchema },
        },
        200,
        "array"
      ),
    },
  });

  fastify.delete<{ Params: { id: string } }>("/:id", {
    ...auth.requiredRole(fastify, "ROLE_ADMIN"),

    handler: productController.handleDeteleProduct,
    schema: {
      ...requiredIdParam,
      ...commonResponseSchema({ message: { type: "string" } }),
    },
  });

  fastify.put("/show/:id", {
    ...auth.requiredRole(fastify, "ROLE_ADMIN"),

    handler: productController.handleUpdtateShowOnHomepage,
    schema: {
      ...requiredIdParam,
      body: {
        type: "object",
        properties: {
          showHomepage: { type: "boolean" },
        },
        required: ["showHomepage"],
      },
      ...commonResponseSchema({ message: { type: "string" } }),
    },
  });

  fastify.get("/random/:id", {
    handler: productController.handleGetRelatedProducts,
    schema: {
      ...requiredIdParam,
      ...commonResponseSchema(
        {
          items: { type: "object", properties: productSchema },
        },
        200,
        "array"
      ),
    },
  });

  fastify.get("/show-on-homepage", {
    handler: productController.handleGetShowOnHomepage,
    schema: {
      ...commonResponseSchema(
        {
          items: { type: "object", properties: productSchema },
        },
        200,
        "array"
      ),
    },
  });

  fastify.get("/search", {
    handler: productController.handleSearchAutoComplete,
    schema: {
      querystring: {
        type: "object",
        properties: {
          name: { type: "string" },
        },
        required: ["name"],
      },
      ...commonResponseSchema(
        {
          items: { type: "object", properties: productSchema },
        },
        200,
        "array"
      ),
    },
  });

  fastify.get<{ Querystring: FilterCriteria }>("/filter", {
    handler: productController.handleFilterProducts,
    schema: {
      querystring: {
        type: "object",

        required: ["page"],
      },

      ...commonResponseSchema(filteredProductSchema),
    },
  });
};

export default productRoutes;
