import { RouteHandler } from "fastify";
import User from "../models/user.model";
import { ErrorResponse } from "../errors/ErrorResponse";
import PasswordResetToken from "../models/password-reset-token.model";
import crypto from "crypto";
import mailer from "../utils/mailer";
import bcrypt from "bcrypt";
const handleSendOTP: RouteHandler<{ Body: ForgotPasswordRequest }> = async (
  req,
  reply
) => {
  try {
    const user = await User.findOne({ email: req.body.email }).exec();

    if (!user) {
      return ErrorResponse.sendError(
        reply,
        "Your email is not registered",
        404
      );
    }

    await PasswordResetToken.deleteMany({ email: req.body.email }).exec();

    const token = crypto.randomBytes(32).toString("hex");
    const otp = crypto.randomInt(100000, 999999).toString();

    const passwordResetToken = new PasswordResetToken({
      email: req.body.email,
      token,
      otp,
      user: user._id,
      expiryDate: new Date(Date.now() + 60 * 3 * 1000),
    });

    await passwordResetToken.save();

    if (!passwordResetToken) {
      return ErrorResponse.sendError(reply, "Error sending OTP", 500);
    }

    await mailer.sendMail(
      user.email,
      "Reset your password",
      "forgot-password",
      {
        otp,
      }
    );

    reply.send({ token });
  } catch (error) {
    console.error("Error sending OTP:", error);

    throw new Error("Error sending OTP");
  }
};

const handleValidateOTP: RouteHandler<{ Body: ForgotPasswordRequest }> = async (
  req,
  reply
) => {
  try {
    const { token, otp } = req.body;

    const passwordResetToken = await PasswordResetToken.findOne({
      token,
      otp,
    }).exec();

    if (!passwordResetToken) {
      return ErrorResponse.sendError(reply, "Invalid OTP", 400);
    }

    if (passwordResetToken.expiryDate < new Date()) {
      return ErrorResponse.sendError(reply, "OTP expired", 400);
    }

    const newToken = crypto.randomBytes(32).toString("hex");

    passwordResetToken.token = newToken;

    await passwordResetToken.save();

    return reply.send({ token: newToken });
  } catch (error) {
    console.error("Error validating OTP:", error);

    throw new Error("Error validating OTP");
  }
};

const handleResetPassword: RouteHandler<{
  Body: ForgotPasswordRequest;
}> = async (req, reply) => {
  try {
    const { token, password } = req.body;

    const passwordResetToken = await PasswordResetToken.findOne({
      token,
    }).exec();

    if (!passwordResetToken) {
      return ErrorResponse.sendError(reply, "Invalid token", 400);
    }

    if (passwordResetToken.expiryDate < new Date()) {
      return ErrorResponse.sendError(reply, "Token expired", 400);
    }

    const newPassword = bcrypt.hashSync(password, 12);

    const user = await User.findByIdAndUpdate(
      passwordResetToken.user,
      { password: newPassword },
      { new: true }
    ).exec();

    if (!user) {
      return ErrorResponse.sendError(reply, "User not found", 404);
    }

    await PasswordResetToken.deleteOne({ token }).exec();

    return reply.send({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);

    throw new Error("Error resetting password");
  }
};

export default {
  handleSendOTP,
  handleValidateOTP,
  handleResetPassword,
};
