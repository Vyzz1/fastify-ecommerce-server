import { model, models, Schema } from "mongoose";
import { spec } from "node:test/reporters";

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    orderDetails: [
      {
        type: Schema.Types.ObjectId,
        ref: "OrderDetails",
        required: true,
      },
    ],
    address: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    specify: {
      type: String,
      required: false,
    },
    total: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      enum: ["cash", "stripe"],
      required: true,
    },
    statusPay: {
      type: String,
      enum: ["pending", "paid"],
      required: false,
    },
    referenceId: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const Order = models?.Order || model("Order", orderSchema);

export default Order;
