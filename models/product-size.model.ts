import { model, models, Schema } from "mongoose";

const productSizeSchema = new Schema({
  value: {
    type: String,
    required: true,
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
});

const ProductSize =
  models?.ProductSize || model("ProductSize", productSizeSchema);
