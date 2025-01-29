import { FastifyInstance } from "fastify";
import validateJwt from "../hooks/validateJwt";
import validateRole from "../hooks/validateRole";

const requiredRole = (fastify: FastifyInstance, ...role: string[]) => ({
  onRequest: fastify.auth([validateJwt, validateRole(...role)], {
    relation: "and",
  }),
});

const requiredAuth = (fastify: FastifyInstance) => ({
  onRequest: fastify.auth([validateJwt], { relation: "and" }),
});

const authRequiredHook = async (fastify: FastifyInstance) => {
  fastify.addHook("onRequest", fastify.auth([validateJwt]));
};

const roleRequiredHook = (fastify: FastifyInstance, ...roleName: string[]) => {
  fastify.addHook(
    "onRequest",
    fastify.auth([validateJwt, validateRole(...roleName)], {
      relation: "and",
    })
  );
};

export default {
  requiredRole,
  requiredAuth,
  authRequiredHook,
  roleRequiredHook,
};
