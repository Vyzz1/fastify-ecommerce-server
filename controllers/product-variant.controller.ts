import { RouteHandler } from "fastify";
import { Model } from "mongoose";
import { ErrorResponse } from "../errors/ErrorResponse";

class ProductVariantController<T extends Document> {
  // constructor to initialize the model
  constructor(private readonly model: Model<T>) {}

  //methods
  public checkDuplicateProductVariantName = async (
    value: string,
    type: "create" | "update",
    excludeId?: string
  ) => {
    const duplicate = await this.model
      .findOne({
        value: value,
      })
      .exec();

    if (duplicate && type === "create") {
      return true;
    } else if (duplicate && duplicate._id.toString() !== excludeId) {
      return true;
    }
    return false;
  };

  public handleGetById: RouteHandler<{ Params: { id: string } }> = async (
    request,
    reply
  ) => {
    const { id } = request.params;
    const productVariant = await this.model.findById(id).exec();

    if (!productVariant) {
      return ErrorResponse.sendError(reply, "Product Variant not found", 404);
    }

    return reply.send(productVariant);
  };

  public handleCreate: RouteHandler<{ Body: ProductVariants }> = async (
    request,
    reply
  ) => {
    const isDuplicate = await this.checkDuplicateProductVariantName(
      request.body.value,
      "create"
    );

    if (isDuplicate) {
      return ErrorResponse.sendError(
        reply,
        "Product Variant name already exists",
        409
      );
    }

    const newProductVariant = new this.model({
      ...request.body,
    });

    await newProductVariant.save();
    return reply.code(201).send(newProductVariant);
  };

  public handleGetAll: RouteHandler = async (_, reply) => {
    const productVariants = await this.model.find().exec();
    return reply.send(productVariants);
  };

  public handleUpdate: RouteHandler<{
    Params: { id: string };
    Body: ProductVariants;
  }> = async (request, reply) => {
    const { id } = request.params;
    const productVariant = await this.model.findById(id).exec();

    if (!productVariant) {
      return ErrorResponse.sendError(reply, "Product Variant not found", 404);
    }

    const isDuplicate = await this.checkDuplicateProductVariantName(
      request.body.value,
      "update",
      id.toString()
    );

    if (isDuplicate) {
      return ErrorResponse.sendError(
        reply,
        "Product Variant name already exists",
        409
      );
    }

    productVariant.set(request.body);
    await productVariant.save();

    return reply.send(productVariant);
  };

  public handleDelete: RouteHandler<{ Params: { id: string } }> = async (
    request,
    reply
  ) => {
    const { id } = request.params;
    const productVariant = await this.model.findByIdAndDelete(id).exec();

    if (!productVariant) {
      return ErrorResponse.sendError(reply, "Product Variant not found", 404);
    }

    return reply.send({ message: "Product Variant deleted successfully" });
  };
}

export default ProductVariantController;
