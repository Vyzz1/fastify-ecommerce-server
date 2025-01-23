import { model, models, Schema } from "mongoose";

const productColorSchema = new Schema({
  value: {
    type: String,
    required: true,
  },
  // product: {
  //   type: Schema.Types.ObjectId,
  //   ref: "Product",
  //   required: true,
  // },
});

const ProductColor =
  models?.ProductColor || model("ProductColor", productColorSchema);

export default ProductColor;
