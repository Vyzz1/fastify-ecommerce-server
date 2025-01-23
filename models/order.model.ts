import { model, models, Schema } from "mongoose";

const orderSchema = new Schema({
  createdAt: {
    type: Date,
    default: Date.now(),
  },
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
  orderdetails: [
    {
      type: Schema.Types.ObjectId,
      ref: "OrderDetails",
    },
  ],
  address: {
    type: String,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  shippingFee: {
    type: Number,
    required: true,
  },
});

const Order = models?.Order || model("Order", orderSchema);

export default Order;
