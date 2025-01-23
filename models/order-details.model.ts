import { model, models, Schema } from "mongoose";

const orderDetailsSchema = new Schema({
  quantity: {
    type: Number,
    required: true,
  },
  productItem: {
    type: Schema.Types.ObjectId,
    ref: "ProductItem",
    required: true,
  },
});

const OrderDetails =
  models?.OrderDetails || model("OrderDetails", orderDetailsSchema);

export default OrderDetails;
