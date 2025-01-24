import { model, models, Schema } from "mongoose";

const shoppingCartItemSchema = new Schema({
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1."],
  },
  shoppingCart: {
    type: Schema.Types.ObjectId,
    ref: "ShoppingCart",
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
