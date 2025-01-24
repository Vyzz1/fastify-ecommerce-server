import { RouteHandler } from "fastify";
import Product from "../models/product.model";
import ProductItem from "../models/product-item.model";
import { ErrorResponse } from "../errors/ErrorResponse";
import ProductSize from "../models/product-size.model";

const createProductItem: RouteHandler<{
  Params: { productId: string };
  Body: ProductItemRequest;
}> = async (request, reply) => {
  const { productId } = request.params;

  const { productSizeId, quantity } = request.body;

  const productItemsExisting = await ProductItem.find({
    product: productId,
  }).exec();

  const product = await Product.findById(productId).exec();

  if (!product) {
    ErrorResponse.sendError(reply, "Product not found", 404);
  }

  const isSizeExits = productItemsExisting.find(
    (item) => item.productSize == productSizeId
  );

  if (isSizeExits) {
    return ErrorResponse.sendError(reply, "Product Size already exists", 409);
  }

  const newProductItem = await ProductItem.create({
    quantity,
    productSize: productSizeId,
    product: productId,
  });

  product!.productItems.push(newProductItem._id);

  await product!.save();

  return reply.code(201).send(newProductItem);
};

const deleteOneProductItem: RouteHandler<{ Params: { id: string } }> = async (
  request,
  reply
) => {
  const { id } = request.params;

  const productItem = await ProductItem.findByIdAndDelete(id).exec();

  if (!productItem) {
    return ErrorResponse.sendError(reply, "Product Item not found", 404);
  }

  return reply.code(204).send();
};

const findProductItemById: RouteHandler<{ Params: { id: string } }> = async (
  request,
  reply
) => {
  const { id } = request.params;

  const productItem = await ProductItem.findById(id).exec();

  if (!productItem) {
    return ErrorResponse.sendError(reply, "Product Item not found", 404);
  }

  return reply.send(productItem);
};

const updateProductItem: RouteHandler<{
  Params: { id: string };
  Body: ProductItemRequest;
}> = async (request, reply) => {
  const { id } = request.params;
  const { quantity, productSizeId } = request.body;

  const productItem = await ProductItem.findById(id).exec();
  if (!productItem) {
    return ErrorResponse.sendError(reply, "Product Item not found", 404);
  }

  //check for duplicates
  if (productSizeId !== productItem.productSize.toString()) {
    const productItemsExisting = await ProductItem.find({
      product: productItem.product,
    }).exec();

    const isSizeExits = productItemsExisting.find(
      (item) => item.productSize == productSizeId
    );

    if (isSizeExits) {
      return ErrorResponse.sendError(reply, "Product Size already exists", 409);
    }

    const productSize = await ProductSize.findById(productSizeId).exec();
    if (!productSize) {
      return ErrorResponse.sendError(reply, "Product Size not found", 404);
    }

    productItem.productSize = productSizeId;
  }

  if (quantity !== productItem.quantity) {
    productItem.quantity = quantity;
  }
  await productItem.save();

  return reply.send(productItem);
};

export default {
  findProductItemById,
  createProductItem,
  deleteOneProductItem,
  updateProductItem,
};
