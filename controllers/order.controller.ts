import { RouteHandler } from "fastify";
import Order from "../models/order.model";
import ProductItem from "../models/product-item.model";
import OrderDetails from "../models/order-details.model";
import { request } from "http";
import Product from "../models/product.model";

const createOrder: RouteHandler<{ Body: OrderRequest }> = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new Error("User not found");
    }

    const { address, total, shippingFee, orderDetails } = req.body;

    const formattedAddress = `${address.province}, ${address.district}, ${address.ward}`;

    const orderDetailsIds = await createOrderDetails(orderDetails);

    await Order.create({
      user: userId,
      address: formattedAddress,
      fullName: address.fullName,
      phoneNumber: address.phoneNumber,
      specify: address.specify,
      total,
      shippingFee,
      orderDetails: orderDetailsIds,
    });

    res.code(201).send({ message: "Order created" });
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

const getUserOrders: RouteHandler = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new Error("User not found");
    }

    const orders = await Order.find({ user: userId }).populate("orderdetails");

    res.send({ orders });
  } catch (error) {
    console.log(error);
    throw new Error("Error while getting user orders");
  }
};

const getOrderById: RouteHandler<{ Params: { id: string } }> = async (
  req,
  res
) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findById(orderId);

    const orderDetails = await OrderDetails.find({
      _id: {
        $in:
          order?.OrderDetails.map(
            (orderDetail: { _id: any }) => orderDetail._id
          ) || [],
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    res.send({ order });
  } catch (error) {
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

export default {
  getUserOrders,
  createOrder,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
};
