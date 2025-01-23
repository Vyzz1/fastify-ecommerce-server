import { FastifyReply, FastifyRequest } from "fastify";

const validateRole = function (...requiredRole: string[]) {
  return async function (request: FastifyRequest, reply: FastifyReply) {
    const userRole = request.user!.role;

    if (!userRole || !requiredRole.includes(userRole)) {
      reply.code(403).send({ message: "Forbidden" });
    }
  };
};

export default validateRole;
