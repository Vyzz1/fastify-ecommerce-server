import { model, models, Schema } from "mongoose";

const shoppingCartSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  cartItems: [
    {
      type: Schema.Types.ObjectId,
      ref: "ShoppingCartItem",
    },
  ],
});

const ShoppingCart =
  models?.ShoppingCart || model("ShoppingCart", shoppingCartSchema);

export default ShoppingCart;
