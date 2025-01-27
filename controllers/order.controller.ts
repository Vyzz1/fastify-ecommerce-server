import { RouteHandler } from "fastify";
import Order from "../models/order.model";
import ProductItem from "../models/product-item.model";
import OrderDetails from "../models/order-details.model";
import Address from "../models/address.model";
import { ErrorResponse } from "../errors/ErrorResponse";
import { populate } from "dotenv";
import path from "path";

const createOrder: RouteHandler<{ Body: OrderRequest }> = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new Error("User not found");
    }

    const { address, total, shippingFee, orderDetails } = req.body;

    const findAddress = await Address.findById(address).exec();

    if (!findAddress) {
      return ErrorResponse.sendError(res, "Address not found", 404);
    }

    const formattedAddress = `${findAddress.province}, ${findAddress.district}, ${findAddress.ward}`;

    const orderDetailsIds = await createOrderDetails(orderDetails);

    const newOrder = await Order.create({
      user: userId,
      address: formattedAddress,
      fullName: findAddress.fullName,
      phoneNumber: findAddress.phoneNumber,
      specify: findAddress.specify,
      total,
      shippingFee,
      orderDetails: orderDetailsIds,
    });
    await newOrder.populate({
      path: "orderDetails",

      populate: {
        path: "productItem",
        select: "quantity",
        populate: [
          {
            path: "product",
            select: "name price avatar",
            populate: {
              path: "productColor",
              select: "value",
            },
          },
          {
            path: "productSize",
            select: "value",
          },
        ],
      },
    });

    res.code(201).send(newOrder);
  } catch (error) {
    console.log(error);
    throw new Error("Error while creating order");
  }
};

async function createOrderDetails(
  orderDetails: OrderDetailsRequest[]
): Promise<string[]> {
  let Ids = [];

  for (const order of orderDetails) {
    const productItemId = order.productItemId;

    const productItem = await ProductItem.findById(order.productItemId);
    if (!productItem) {
      throw new Error("Product not found");
    }

    productItem.quantity -= order.quantity;

    if (productItem.quantity < 0) {
      throw new Error("Product out of stock");
    }

    await productItem.save();

    const newOrderDetail = await OrderDetails.create({
      productItem: productItemId,
      quantity: order.quantity,
    });

    Ids.push(newOrderDetail._id);
  }

  return Ids;
}

const getOrderById: RouteHandler<{ Params: { id: string } }> = async (
  req,
  res
) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findById(orderId)
      .populate({
        path: "orderDetails",

        populate: {
          path: "productItem",
          select: "quantity",
          populate: [
            {
              path: "product",
              select: "name price avatar",
              populate: {
                path: "productColor",
                select: "value",
              },
            },
            {
              path: "productSize",
              select: "value",
            },
          ],
        },
      })
      .lean()
      .exec();

    if (!order) {
      throw new Error("Order not found");
    }

    res.send(order);
  } catch (error) {
    console.log(error);

    throw new Error("Error while getting order by id");
  }
};

const updateOrderStatus: RouteHandler<{
  Params: { id: string };
  Body: { status: string };
}> = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    await Order.findByIdAndUpdate(orderId, { status });

    res.send({ message: "Order status updated" });
  } catch (error) {
    throw new Error("Error while updating order status");
  }
};

const deleteOrder: RouteHandler<{ Params: { id: string } }> = async (
  request,
  reply
) => {
  try {
    const orderId = request.params.id;
    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    order.orderDetails.forEach(async (orderDetail: any) => {
      OrderDetails.findByIdAndDelete(orderDetail._id);
    });

    reply.send({ message: "Order deleted" });
  } catch (error) {
    throw new Error("Error while deleting order");
  }
};

const handleGetUsersOrders: RouteHandler = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return ErrorResponse.sendError(res, "Unauthorized", 401);
    }

    const orders = await Order.find({ user: userId })
      .populate([
        {
          path: "orderDetails",
          populate: {
            path: "productItem",
            select: "quantity",
            populate: [
              {
                path: "product",
                select: "name price avatar",
                populate: {
                  path: "productColor",
                  select: "value",
                },
              },
              {
                path: "productSize",
                select: "value",
              },
            ],
          },
        },
      ])
      .lean();

    return res.send(orders || []);
  } catch (error) {
    console.error(error);
    throw new Error("An error occurred");
  }
};

export default {
  createOrder,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  handleGetUsersOrders,
};
