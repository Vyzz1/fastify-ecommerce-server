import Fastify from "fastify";
import dotenv from "dotenv";
import { JwtPayload } from "jsonwebtoken";
import cookie from "@fastify/cookie";
import cors from "./config/cors";
import { errorResponseSchema, userSchema } from "./schemas";
import connectToDB from "./utils/connect";
import authRouter from "./routes/auth.route";
import categoryRouter from "./routes/category.route";
import multer from "fastify-multer";
import fileRouter from "./routes/file.route";
import brandRouter from "./routes/brand.route";
import ProductColorRouter from "./routes/product-color.route";
import ProductSize from "./models/product-size.model";
import ProductSizeRouter from "./routes/product-size.route";

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

// register plugins
fastify.register(import("@fastify/auth"));

fastify.register(cors);

// register multer
fastify.register(multer.contentParser);

// for parsing multipart/form-data
fastify.addContentTypeParser("multipart/form-data", (_, payload, done) => {
  done(null, payload);
});

// global schemas
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

// routes
fastify.register(authRouter, { prefix: "/auth" });
fastify.register(categoryRouter, { prefix: "/category" });
fastify.register(brandRouter, { prefix: "/brand" });
fastify.register(fileRouter, { prefix: "/file" });
fastify.register(ProductColorRouter, { prefix: "/color" });
fastify.register(ProductSizeRouter, { prefix: "/size" });

// start the server

fastify.listen({ port: PORT }, async (err, address) => {
  await connectToDB();

  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
