import { RouteHandler } from "fastify";
import { Model } from "mongoose";
import { ErrorResponse } from "../errors/ErrorResponse";

class ProductParentsController<T extends Document> {
  // generic type T extends Document

  // constructor to initialize the model
  constructor(private readonly model: Model<T>) {}
  public checkDuplicateProductVariantName = async (
    name: string,
    type: "create" | "update",
    excludeId?: string
  ) => {
    const duplicate = await this.model
      .findOne({
        name: name,
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

  public handleCreate: RouteHandler<{ Body: ProductParents }> = async (
    request,
    reply
  ) => {
    try {
      const isDuplicate = await this.checkDuplicateProductVariantName(
        request.body.name,
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
    } catch (error) {
      console.log(error);
      return ErrorResponse.sendError(reply, "error", 500);
    }
  };

  public handleGetAll: RouteHandler = async (_, reply) => {
    const productVariants = await this.model.find().exec();
    return reply.send(productVariants);
  };

  public handleUpdate: RouteHandler<{
    Params: { id: string };
    Body: ProductParents;
  }> = async (request, reply) => {
    const { id } = request.params;
    const { name } = request.body;

    const isDuplicate = await this.checkDuplicateProductVariantName(
      name,
      "update",
      id
    );

    if (isDuplicate) {
      return ErrorResponse.sendError(
        reply,
        "Product Variant name already exists",
        409
      );
    }

    const updatedProductVariant = await this.model.findByIdAndUpdate(
      id,
      request.body,
      { new: true }
    );

    if (!updatedProductVariant) {
      return ErrorResponse.sendError(reply, "Product Variant not found", 404);
    }

    return reply.send(updatedProductVariant);
  };

  public handleDelete: RouteHandler<{ Params: { id: string } }> = async (
    request,
    reply
  ) => {
    const { id } = request.params;
    const deletedProductVariant = await this.model.findByIdAndDelete(id).exec();

    if (!deletedProductVariant) {
      return ErrorResponse.sendError(reply, "Product Variant not found", 404);
    }

    return reply.send(deletedProductVariant);
  };
}

export default ProductParentsController;
