import cors, { FastifyCorsOptions } from "@fastify/cors";
import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
const corsOptions: FastifyCorsOptions = {
  origin: [
    "http://localhost:3000",
    "https://react-js-ecommerce-weld.vercel.app",
  ],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE"],
};

async function corsPlugin(fastify: FastifyInstance) {
  fastify.register(cors, corsOptions);
}

export default fp(corsPlugin);
