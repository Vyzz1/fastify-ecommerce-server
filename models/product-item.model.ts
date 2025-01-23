import { Schema, models, model } from "mongoose";

const productItemSchema = new Schema({
  quantity: {
    type: Number,
    required: true,
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  productSize: {
    type: Schema.Types.ObjectId,
    ref: "ProductSize",
    required: true,
  },
});

const ProductItem =
  models?.ProductItem || model("ProductItem", productItemSchema);

export default ProductItem;
