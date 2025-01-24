import { FastifyInstance } from "fastify";
import validateJwt from "../hooks/validateJwt";
import validateRole from "../hooks/validateRole";

const requiredRole = (fastify: FastifyInstance, ...roleName: string[]) => ({
  onRequest: fastify.auth([validateJwt, validateRole(...roleName)], {
    relation: "and",
  }),
});

const requiredAuth = (fastify: FastifyInstance) => ({
  onRequest: fastify.auth([validateJwt]),
});

const authRequiredHook = (fastify: FastifyInstance) => {
  return fastify.addHook(
    "onRequest",
    fastify.auth([validateJwt], { relation: "and" })
  );
};

const roleRequiredHook = (fastify: FastifyInstance, ...roleName: string[]) => {
  fastify.addHook(
    "onRequest",
    fastify.auth([validateJwt, validateRole(...roleName)], {
      relation: "and",
    })
  );
};
const checkDuplicateField = async (
  field: "value" | "name", // Tên trường cần kiểm tra
  value: string,
  model: any, // Giá trị của trường
  type: "create" | "update", // Loại hành động
  excludeId?: string // ID cần loại trừ (khi cập nhật)
) => {
  const duplicate = await model
    .findOne({
      [field]: value, // Sử dụng tên trường động
    })
    .exec();

  if (duplicate && type === "create") {
    return true; // Trùng lặp khi tạo mới
  } else if (duplicate && duplicate._id.toString() !== excludeId) {
    return true; // Trùng lặp khi cập nhật (không cùng ID)
  }
  return false; // Không trùng lặp
};

export default {
  requiredRole,
  requiredAuth,
  authRequiredHook,
  roleRequiredHook,
};
