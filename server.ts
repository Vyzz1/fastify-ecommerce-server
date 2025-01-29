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
import addressRouter from "./routes/address.route";
import productItemRouter from "./routes/product-item.route";
import shoppingCartRouter from "./routes/shopping-cart.route";
import productRoutes from "./routes/product.route";
import orderRoute from "./routes/order.route";
import passwordRouter from "./routes/password.route";
import paymentRouter from "./routes/payment.route";

const fastify = Fastify();

const PORT = 8000;

dotenv.config();

declare module "fastify" {
  interface FastifyRequest {
    user: UserJWTPayload | null;
    rawBody: string;
  }
}

fastify.decorateRequest("user", null);

// middlewares
fastify.register(cookie, {
  secret: "mysecret",
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
fastify.register(addressRouter, { prefix: "/address" });
fastify.register(productItemRouter, { prefix: "/product-item" });
fastify.register(shoppingCartRouter, { prefix: "/cart" });
fastify.register(productRoutes, { prefix: "/product" });
fastify.register(orderRoute, { prefix: "/order" });
fastify.register(passwordRouter, { prefix: "/password" });
fastify.register(paymentRouter, { prefix: "/payment" });

fastify.addHook("onRequest", async (req) => {
  console.log(`Request received: ${req.method} ${req.url} `);

  console.log("Cookies", req.cookies.refreshToken);
});

// start the server

fastify.listen({ port: PORT }, async (err, address) => {
  await connectToDB();

  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
