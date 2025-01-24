import { RouteHandler } from "fastify";
import ShoppingCart from "../models/shopping-cart.model";
import ProductItem from "../models/product-item.model";
import { ErrorResponse } from "../errors/ErrorResponse";
import ShoppingCartItem from "../models/shopping-cart-item.model";

const handleCreateShoppingCart: RouteHandler<{ Body: CartRequest }> = async (
  request,
  reply
) => {
  try {
    const { quantity, productItemId } = request.body;

    if (!!quantity && quantity < 1) {
      return ErrorResponse.sendError(reply, "Quantity must be at least 1", 400);
    }

    const { id } = request.user!;
    const productItem = await ProductItem.findById(productItemId).exec();

    if (!productItem) {
      return ErrorResponse.sendError(reply, "Product Item not found", 404);
    }

    let existingCart = await ShoppingCart.findOne({ user: id }).exec();

    if (!existingCart) {
      existingCart = new ShoppingCart();
      existingCart.user = id;
    }

    const exisitingOptions = await ShoppingCartItem.findOne({
      productItem: productItemId,
      shoppingCart: existingCart._id,
    }).exec();

    //if the product item already exists in the cart

    //then update the quantity
    if (exisitingOptions) {
      exisitingOptions.quantity += quantity;
      await exisitingOptions.save();
      return reply.code(201).send(exisitingOptions);
    }

    //if the product item does not exist in the cart

    //then create a new cart item
    const newCartItem = new ShoppingCartItem({
      quantity,
      shoppingCart: existingCart._id,
      productItem: productItemId,
    });

    existingCart.cartItems.push(newCartItem._id);

    const response = await existingCart.save();

    return reply.code(201).send(response);
  } catch (error) {
    console.log(error);
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

    const cartItem = await ShoppingCartItem.findByIdAndDelete(id).exec();

    if (!cartItem) {
      return ErrorResponse.sendError(reply, "Cart Item not found", 404);
    }

    return reply.code(204).send();
  } catch (error) {
    console.log(error);
    return ErrorResponse.sendError(reply, "Internal Server Error", 500);
  }
};

const handleGetUserCart: RouteHandler = async (request, reply) => {
  try {
    const { id } = request.user!;

    const cart = await ShoppingCart.findOne({ user: id })
      .populate("cartItems")
      .populate("cartItems.productItem")
      .exec();

    return reply.send(cart || []);
  } catch (error) {
    console.log(error);
    return ErrorResponse.sendError(reply, "Internal Server Error", 500);
  }
};

export default {
  handleCreateShoppingCart,
  handleUpdateQuantity,
  handleDeleteCartItem,
  handleGetUserCart,
};
