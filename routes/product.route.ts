import { FastifyPluginAsync } from "fastify";
import productController from "../controllers/product.controller";
import {
  commonResponseSchema,
  errorResponse,
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
      response: {
        ...errorResponse,
      },
    },
  });

  fastify.get<{ Params: { id: string } }>("/:id", {
    handler: productController.handleGetProduct,
  });

  fastify.get("/", {
    handler: productController.handleGetAllProducts,
    ...auth.requiredRole(fastify, "ROLE_ADMIN"),
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
      response: {
        ...errorResponse,
      },
    },
  });

  fastify.get("/random/:id", {
    handler: productController.handleGetRelatedProducts,
    schema: {
      ...requiredIdParam,
      response: {
        ...errorResponse,
      },
    },
  });

  fastify.get("/show-on-homepage", productController.handleGetShowOnHomepage);

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
      response: {
        ...errorResponse,
      },
    },
  });

  fastify.get<{ Querystring: FilterCriteria }>("/filter", {
    handler: productController.handleFilterProducts,
    schema: {
      querystring: {
        type: "object",

        required: ["page"],
      },
    },
  });
};

export default productRoutes;
