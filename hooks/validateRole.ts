import { FastifyReply, FastifyRequest } from "fastify";

const validateRole = function (...requiredRole: string[]) {
  console.log("Required Role: ", requiredRole);

  return async function (request: FastifyRequest, reply: FastifyReply) {
    console.log("User: ", request.user);

    const userRole = request.user!.role;
    console.log("User Role: ", userRole);

    if (!userRole || !requiredRole.includes(userRole)) {
      reply.code(403).send({ message: "Forbidden" });
    }
  };
};

export default validateRole;
