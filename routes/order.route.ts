import { FastifyPluginAsync } from "fastify";
import orderController from "../controllers/order.controller";
import auth from "../utils/auth";
import {
  commonResponseSchema,
  orderDetailSchema,
  orderSchema,
  requiredIdParam,
} from "../schemas";

const orderRoute: FastifyPluginAsync = async (fastify, opts) => {
  fastify.post<{ Body: OrderRequest }>("/", {
    ...auth.requiredRole(fastify, "ROLE_USER"),
    handler: orderController.createOrder,
    schema: {
      body: {
        type: "object",

        required: ["address", "total", "shippingFee", "orderDetails"],
      },
      ...commonResponseSchema(orderSchema, 201),
    },
  });

  fastify.put<{ Body: { status: string }; Params: { id: string } }>(
    "/:id",

    {
      ...auth.requiredRole(fastify, "ROLE_ADMIN", "ROLE_USER"),
      handler: orderController.updateOrderStatus,
      schema: {
        body: {
          type: "object",
          required: ["status"],
          properties: {
            status: { type: "string" },
          },
        },
        ...requiredIdParam,
        ...commonResponseSchema({ message: { type: "string" } }),
      },
    }
  );

  fastify.delete<{ Params: { id: string } }>("/:id", {
    ...auth.requiredRole(fastify, "ROLE_ADMIN"),
    handler: orderController.deleteOrder,
    schema: {
      ...requiredIdParam,
      ...commonResponseSchema({ message: { type: "string" } }),
    },
  });

  fastify.get("/:id", {
    handler: orderController.getOrderById,
    schema: {
      ...requiredIdParam,
      ...commonResponseSchema(orderSchema),
    },
  });

  fastify.get("/", {
    ...auth.requiredRole(fastify, "ROLE_USER"),
    handler: orderController.handleGetUsersOrders,
    schema: {
      ...commonResponseSchema(
        {
          items: {
            type: "object",
            properties: orderSchema,
          },
        },
        200,
        "array"
      ),
    },
  });

  fastify.get(
    "/all",

    {
      ...auth.requiredRole(fastify, "ROLE_ADMIN"),
      handler: orderController.handleGetAllOrders,
      schema: {
        ...commonResponseSchema(
          {
            items: {
              type: "object",
              properties: orderSchema,
            },
          },
          200,
          "array"
        ),
      },
    }
  );

  fastify.get("/payment", {
    handler: orderController.handleGetByReferenceId,
    schema: {
      query: {
        type: "object",
        required: ["referenceId"],
        properties: {
          referenceId: { type: "string" },
        },
      },
      ...commonResponseSchema(orderSchema),
    },
  });
};

export default orderRoute;
