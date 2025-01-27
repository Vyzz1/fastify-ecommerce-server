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
    required: false,
  },
  productItem: {
    type: Schema.Types.ObjectId,
    ref: "ProductItem",
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
});

shoppingCartItemSchema.index({ productItem: 1, user: 1 }, { unique: true });

const ShoppingCartItem =
  models?.ShoppingCartItem || model("ShoppingCartItem", shoppingCartItemSchema);

export default ShoppingCartItem;
