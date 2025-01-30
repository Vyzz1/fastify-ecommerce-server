import { RouteHandler } from "fastify";
import { Stripe } from "stripe";
import User from "../models/user.model";
import Payment from "../models/payment.model";
import { ErrorResponse } from "../errors/ErrorResponse";
import Order from "../models/order.model";
import mailer from "../utils/mailer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const handleCreatePaymentIntent: RouteHandler<{
  Body: {
    request: ProductPaymentRequest[];
    total: number;
    referenceId: string;
  };
}> = async (request, reply) => {
  try {
    const items = request.body;

    const user = await User.findById(request.user?.id).exec();

    if (!user) {
      return ErrorResponse.sendError(reply, "User not found", 404);
    }

    const sessions = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.request.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "usd",
          product_data: {
            name: item.productItem.product.name,
            images: [item.productItem.product.avatar],
            metadata: {
              color: item.productItem.product.productColor.value,
              size: item.productItem.productSize!.value,
              user: user._id.toString(),
              productName: item.productItem.product.name,
              avatar: item.productItem.product.avatar,
              productId: item.productItem.product._id.toString(),
            },
          },
          unit_amount: item.productItem.product.price * 100,
        },
      })),
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success?referenceId=${request.body.referenceId}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel?referenceId=${request.body.referenceId}`,
    });

    await Payment.create({
      total: request.body.total,
      method: "stripe",
      status: "pending",
      user: user._id,
      sessionId: sessions.id,
      referenceId: request.body.referenceId,
      product: items.request.map((item) => ({
        quantity: item.quantity,
        name: item.productItem.product.name,
        price: item.productItem.product.price,
        avatar: item.productItem.product.avatar,
        color: item.productItem.product.productColor.value,
        size: item.productItem.productSize!.value,
      })),
    });

    return reply.send({ url: sessions.url });
  } catch (error) {
    console.error(error);
    throw new Error("An error occurred");
  }
};

const handleWebhook: RouteHandler = async (request, reply) => {
  try {
    const sig = request.headers["stripe-signature"] as string;
    const rawBody = request.rawBody;

    const event = stripe.webhooks.constructEvent(
      rawBody!,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const payment = await Payment.findOne({ sessionId: session.id }).exec();

      if (payment) {
        payment.status = "paid";
        await payment.save();
      } else {
        console.error("Payment not found for session:", session.id);
      }
      const order = await Order.findOne({ referenceId: payment.referenceId })
        .populate("user")
        .exec();

      if (order) {
        order.statusPay = "paid";
        await order.save();
      } else {
        console.error("Order not found for payment:", payment.referenceId);
      }
    }

    reply.status(200).send({ received: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    reply.status(400).send(`Webhook Error`);
  }
};

const handleRepay: RouteHandler<{ Body: { referenceId: string } }> = async (
  req,
  reply
) => {
  try {
    const payment = await Payment.findOne({
      referenceId: req.body.referenceId,
    }).exec();

    if (!payment) {
      return ErrorResponse.sendError(reply, "Payment not found", 404);
    }

    const sessions = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: payment.product.map((item: any) => ({
        quantity: item.quantity,
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            images: [item.avatar],
            metadata: {
              color: item.color,
              size: item.size,
              user: payment.user.toString(),
              productName: item.name,
              avatar: item.avatar,
            },
          },
          unit_amount: item.price * 100,
        },
      })),
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success?referenceId=${req.body.referenceId}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel?referenceId=${req.body.referenceId}`,
    });

    payment.status = "pending";
    payment.sessionId = sessions.id;
    await payment.save();

    return reply.send({ url: sessions.url });
  } catch (error) {
    console.error(error);
    throw new Error("An error occurred");
  }
};

const handleGetAllPayments: RouteHandler = async (req, res) => {
  try {
    console.log(req.user);

    const payments = await Payment.find()
      .populate("user")

      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return res.send(payments || []);
  } catch (error) {
    console.error(error);
    throw new Error("An error occurred");
  }
};

const handleGetUserPayments: RouteHandler = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user?.id })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return res.send(payments || []);
  } catch (error) {
    console.error(error);

    throw new Error("An error occurred");
  }
};

export default {
  handleCreatePaymentIntent,
  handleWebhook,
  handleGetAllPayments,
  handleRepay,
  handleGetUserPayments,
};
