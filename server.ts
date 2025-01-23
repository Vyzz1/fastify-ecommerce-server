import Fastify from "fastify";
import dotenv from "dotenv";
import { JwtPayload } from "jsonwebtoken";
import cookie from "@fastify/cookie";
import cors from "./config/cors";
import { errorResponseSchema, userSchema } from "./schemas";
import connectToDB from "./utils/connect";
import authRouter from "./routes/auth.route";

const fastify = Fastify();

const PORT = 8000;

dotenv.config();
declare module "fastify" {
  interface FastifyRequest {
    user: JwtPayload | null;
  }
}

fastify.decorateRequest("user", null);

// middlewares
fastify.register(cookie, {
  secret: "mysecret",
  parseOptions: {
    httpOnly: true,
    sameSite: "strict",
    secure: true,
    path: "/",
  },
});
fastify.register(import("@fastify/auth"));

fastify.register(cors);

fastify.addSchema({
  $id: "ErrorResponse",
  type: "object",
  properties: errorResponseSchema,
});

fastify.addSchema({
  $id: "User",
  type: "object",
  properties: userSchema,
});

fastify.addSchema({
  $id: "CommonMessage",
  type: "object",
  properties: {
    message: { type: "string" },
  },
});

fastify.register(authRouter, { prefix: "/auth" });

fastify.listen({ port: PORT }, async (err, address) => {
  await connectToDB();

  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
