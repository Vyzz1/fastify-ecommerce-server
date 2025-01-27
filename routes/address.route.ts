import { FastifyPluginAsync } from "fastify";
import addressController from "../controllers/address.controller";
import auth from "../utils/auth";
import {
  addressSchema,
  commonResponseSchema,
  errorResponse,
  requiredIdParam,
} from "../schemas";

const addressRouter: FastifyPluginAsync = async (fastify, opts) => {
  auth.authRequiredHook(fastify);

  fastify.post("/", {
    handler: addressController.addNewAddress,
    schema: {
      body: {
        type: "object",
        required: [
          "district",
          "province",
          "ward",
          "specify",
          "fullName",
          "phoneNumber",
        ],
      },
      ...commonResponseSchema(addressSchema, 201),
    },
  });
  fastify.get("/", {
    handler: addressController.getAddressUser,
    schema: {
      response: {
        ...errorResponse,
      },
    },
  });

  fastify.put<{ Body: { _id: string } }>("/set-default", {
    handler: addressController.setDefaultAddress,
    schema: {
      body: {
        type: "object",
        required: ["_id"],
      },
      ...commonResponseSchema({ message: { type: "string" } }),
    },
  });

  fastify.put("/:id", {
    handler: addressController.updateAddress,
    schema: {
      ...requiredIdParam,
      body: {
        type: "object",
        required: [
          "district",
          "province",
          "ward",
          "specify",
          "fullName",
          "phoneNumber",
        ],
      },
      ...commonResponseSchema(addressSchema),
    },
  });

  fastify.delete("/:id", {
    handler: addressController.deleteAddress,
    schema: {
      ...requiredIdParam,
      ...commonResponseSchema({ message: { type: "string" } }, 204),
    },
  });

  fastify.get("/:id", {
    handler: addressController.getSpecificAddress,
    schema: {
      ...requiredIdParam,
      ...commonResponseSchema(addressSchema),
    },
  });
};

export default addressRouter;
