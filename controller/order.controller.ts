import { RouteHandler } from "fastify";
import Order from "../models/order.model";
import ProductItem from "../models/product-item.model";
import OrderDetails from "../models/order-details.model";

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
      orderdetails: orderDetailsIds,
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

export default {
  createOrder,
};
