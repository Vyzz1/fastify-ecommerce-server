import { FastifyReply } from "fastify";

export class ErrorResponse {
  constructor(
    public message: string,
    public status: number,
    public timestamp: Date
  ) {
    this.message = message;
    this.status = status;
    this.timestamp = timestamp;
  }

  static sendError(reply: FastifyReply, message: string, status = 400) {
    const er = new ErrorResponse(message, status, new Date());
    reply.status(status).send(er);
    return;
  }
}
