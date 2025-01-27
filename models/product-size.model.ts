import { model, models, Schema } from "mongoose";

const productSizeSchema = new Schema({
  value: {
    type: String,
    required: true,
  },
});

const ProductSize =
  models?.ProductSize || model("ProductSize", productSizeSchema);

export default ProductSize;
