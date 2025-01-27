import { RouteHandler } from "fastify";
import ProductItem from "../models/product-item.model";
import { ErrorResponse } from "../errors/ErrorResponse";
import ShoppingCartItem from "../models/shopping-cart-item.model";

const processingRequests = new Set<string>();

const handleCreateShoppingCart: RouteHandler<{ Body: CartRequest }> = async (
  request,
  reply
) => {
  try {
    const { quantity, productItemId } = request.body;

    if (!quantity || quantity < 1) {
      return ErrorResponse.sendError(reply, "Quantity must be at least 1", 400);
    }
    const { id } = request.user!;
    const uniqueKey = `${id}-${productItemId}`;

    if (processingRequests.has(uniqueKey)) {
      return ErrorResponse.sendError(reply, "Request already in progress", 400);
    }

    processingRequests.add(uniqueKey);

    const productItem = await ProductItem.findById(productItemId).exec();

    if (!productItem) {
      return ErrorResponse.sendError(reply, "Product Item not found", 404);
    }

    if (quantity > productItem.quantity || productItem.quantity < 1) {
      return ErrorResponse.sendError(
        reply,
        "Quantity exceeds available quantity",
        400
      );
    }

    const existingCartItem = await ShoppingCartItem.findOne({
      productItem: productItemId,
      user: id,
    }).exec();

    if (existingCartItem) {
      console.log("existed");

      // Update the quantity if it already exists
      if (existingCartItem.quantity + quantity > productItem.quantity) {
        return ErrorResponse.sendError(
          reply,
          "Quantity exceeds available quantity",
          400
        );
      }

      existingCartItem.quantity += quantity;

      await existingCartItem.save();
      return reply.code(201).send(existingCartItem);
    } else {
      // Create a new cart item if it doesn't exist
      const newCartItem = new ShoppingCartItem({
        quantity,
        user: id,
        productItem: productItemId,
      });

      await newCartItem.save();

      processingRequests.delete(uniqueKey);

      return reply.code(201).send({ cartItem: newCartItem });
    }
  } catch (error) {
    console.error(error);
    return ErrorResponse.sendError(reply, "Internal Server Error", 500);
  }
};

const handleUpdateQuantity: RouteHandler<{
  Params: { id: string };
  Body: { quantity: number };
}> = async (request, reply) => {
  try {
    const { id } = request.params;
    const { quantity } = request.body;

    if (!!quantity && quantity < 1) {
      return ErrorResponse.sendError(reply, "Quantity must be at least 1", 400);
    }

    const cartItem = await ShoppingCartItem.findById(id).exec();

    if (!cartItem) {
      return ErrorResponse.sendError(reply, "Cart Item not found", 404);
    }

    cartItem.quantity = quantity;

    await cartItem.save();

    return reply.send(cartItem);
  } catch (error) {
    console.log(error);
    return ErrorResponse.sendError(reply, "Internal Server Error", 500);
  }
};

const handleDeleteCartItem: RouteHandler<{ Params: { id: string } }> = async (
  request,
  reply
) => {
  try {
    const { id } = request.params;
    console.log(id);

    const cartItem = await ShoppingCartItem.findByIdAndDelete(id).exec();

    if (!cartItem) {
      return ErrorResponse.sendError(reply, "Cart Item not found", 404);
    }

    return reply.code(200).send({ message: "Cart Item deleted" });
  } catch (error) {
    console.log(error);
    return ErrorResponse.sendError(reply, "Internal Server Error", 500);
  }
};

const handleGetUserCart: RouteHandler = async (request, reply) => {
  try {
    const { id } = request.user!;

    const cart = await ShoppingCartItem.find({ user: id })
      .populate({
        path: "productItem",
        populate: [
          {
            path: "product",
            model: "Product",
            select: "name price images productColor avatar",
            populate: {
              path: "productColor",
              model: "ProductColor",
              select: "value",
            },
          },
          { path: "productSize", model: "ProductSize", select: "value" },
        ],
      })
      .exec();

    return reply.send(cart);
  } catch (error) {
    console.error(error);
    return ErrorResponse.sendError(reply, "Internal Server Error", 500);
  }
};

export default {
  handleCreateShoppingCart,
  handleUpdateQuantity,
  handleDeleteCartItem,
  handleGetUserCart,
};
