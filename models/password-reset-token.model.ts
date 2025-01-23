import { model, models, Schema } from "mongoose";

const passwordResetTokenSchema = new Schema({
  token: {
    type: String,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  otp: {
    type: String,
    required: false,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const PasswordResetToken =
  models?.PasswordResetToken ||
  model("PasswordResetToken", passwordResetTokenSchema);

export default PasswordResetToken;
