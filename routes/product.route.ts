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

  fastify.get("/:id/config", {
    handler: productController.handleGetConfigForProduct,
    schema: {
      ...requiredIdParam,
      response: {
        ...errorResponse,
      },
    },
  });

  fastify.delete<{ Params: { id: string } }>("/:id", {
    handler: productController.handleDeteleProduct,
    schema: {
      ...requiredIdParam,
      ...commonResponseSchema({ message: { type: "string" } }),
    },
  });

  fastify.get("/show-on-homepage", productController.handleGetShowOnHomepage);
};

export default productRoutes;
