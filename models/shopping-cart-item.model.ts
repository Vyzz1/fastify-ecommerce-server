import { model, models, Schema } from "mongoose";

const shoppingCartItemSchema = new Schema({
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

const ShoppingCartItem =
  models?.ShoppingCartItem || model("ShoppingCartItem", shoppingCartItemSchema);

export default ShoppingCartItem;
