import { model, models, Schema } from "mongoose";
const productSchema = new Schema({
  quantity: { type: Number, required: true, min: 1 },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  avatar: { type: String, required: true },
  color: { type: String, required: true },
  size: { type: String, required: true },
});
const paymentSchema = new Schema(
  {
    total: {
      type: Number,
      required: true,
      min: 1,
    },
    method: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "paid"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    product: [productSchema],
    referenceId: {
      type: String,
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Payment = models?.Payment || model("Payment", paymentSchema);

export default Payment;
