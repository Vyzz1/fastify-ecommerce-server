import { preHandlerHookHandler } from "fastify";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ErrorResponse } from "../errors/ErrorResponse";
const validateJwt: preHandlerHookHandler = async (request, reply, done) => {
  const auth = request.headers.authorization;
  if (!auth) {
    throw new Error("Unauthorized");
  }

  const token = auth?.split(" ")[1];
  jwt.verify(token!, process.env.ACCESS_TOKEN!, (err, decoded) => {
    if (err) {
      ErrorResponse.sendError(reply, "Expired", 401);
    }

    request.user = {
      email: (decoded as JwtPayload).email,
      role: (decoded as JwtPayload).role,
      id: (decoded as JwtPayload).id,
    };

    console.log(request.user);
  });
  done();
};

export default validateJwt;
