import { RouteHandler, RouteHandlerMethod } from "fastify";
import { ErrorResponse } from "../errors/ErrorResponse";
import jwt from "jsonwebtoken";

import bcrypt from "bcrypt";
import User from "../models/user.model";
import { request } from "http";
interface LoginRequest {
  email: string;
  password: string;
}
const loginController: RouteHandler<{ Body: LoginRequest }> = async (
  request,
  reply
) => {
  const { email, password } = request.body;

  const user = await User.findOne({ email }).exec();

  if (!user) {
    return ErrorResponse.sendError(reply, "User not found", 400);
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);

  if (!isPasswordValid) {
    return ErrorResponse.sendError(reply, "Invalid password", 400);
  }

  const accessToken = jwt.sign(
    { email: user.email, role: "user" },
    process.env.ACCESS_TOKEN!,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { email: user.email },
    process.env.REFRESH_TOKEN!,
    { expiresIn: "1d" }
  );

  await User.updateOne({ email: user.email }, { refreshToken });

  reply
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    })
    .send({ accessToken });
};

const registerController: RouteHandler<{ Body: User }> = async (
  request,
  reply
) => {
  try {
    const { email, password } = request.body;

    const reg = new RegExp("^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$");

    if (!reg.test(email)) {
      return ErrorResponse.sendError(reply, "Invalid email", 400);
    }

    const findUser = await User.findOne({ email }).exec();
    if (findUser) {
      return ErrorResponse.sendError(reply, "User already exist", 409);
    }

    const newPassword = bcrypt.hashSync(password, 12);

    const newUser = await User.create({
      ...request.body,
      password: newPassword,
      role: "user",
    });

    reply.status(201).send(newUser);
  } catch (error) {
    console.log(error);
    throw new Error("Error");
  }
};

const refreshController: RouteHandler = async (request, reply) => {
  if (!request.cookies.refreshToken) {
    ErrorResponse.sendError(reply, "Unauthorized", 401);
  }

  const refreshToken = request.cookies.refreshToken;

  const user = await User.findOne({ refreshToken }).exec();

  if (!user) {
    return ErrorResponse.sendError(reply, "Unauthorized", 401);
  }

  const newToken = jwt.sign(
    { email: user!.email },
    process.env.REFRESH_TOKEN!,
    {
      expiresIn: "10s",
    }
  );

  reply.send({ accessToken: newToken });
};

const logoutController: RouteHandler = async (request, reply) => {
  // get cookie

  if (!request.cookies?.refreshToken) {
    return reply.send({ message: "Logout successfully" });
  }

  const refreshToken = request.cookies?.refreshToken;

  const foundUser = await User.findOne({ refreshToken }).exec();

  if (!foundUser) {
    return reply.send({ message: "Logout successfully" });
  }

  foundUser.refreshToken = "";

  await foundUser.save();

  reply.clearCookie("refresToken", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });

  reply.send({ message: "Logout successfully" });
};

const getUserInformation: RouteHandler = async (request, reply) => {
  const email = request.user?.email;

  if (!email) {
    return ErrorResponse.sendError(reply, "Unauthorized", 401);
  }

  const user = await User.findOne({ email }).exec();

  if (!user) {
    return ErrorResponse.sendError(reply, "User not found", 400);
  }

  return reply.send(user);
};

const updateAvatar: RouteHandler<{ Body: { avatar: string } }> = async (
  request,
  reply
) => {
  const email = request.user?.email;

  if (!email) {
    return ErrorResponse.sendError(reply, "Unauthorized", 401);
  }

  const user = await User.findOneAndUpdate(
    { email },
    { avatar: request.body.avatar },
    { new: true }
  ).exec();

  if (!user) {
    return ErrorResponse.sendError(reply, "User not found", 400);
  }

  return reply.send({ message: "Avatar updated successfully" });
};

const updatePassword: RouteHandler<{ Body: ChangePasswordRequest }> = async (
  request,
  reply
) => {
  const email = request.user?.email;

  if (!email) {
    return ErrorResponse.sendError(reply, "Unauthorized", 401);
  }

  const { newPassword, currentPassword } = request.body;

  const user = await User.findOne({ email }).exec();

  if (!user) {
    return ErrorResponse.sendError(reply, "User not found", 400);
  }

  if (!bcrypt.compareSync(currentPassword, user.password)) {
    return ErrorResponse.sendError(reply, "Invalid password", 400);
  }

  if (bcrypt.compareSync(newPassword, user.password)) {
    return ErrorResponse.sendError(
      reply,
      "New password must be different from the old password",
      400
    );
  }

  user.password = bcrypt.hashSync(newPassword, 12);

  await user.save();

  return reply.send({ message: "Password updated successfully" });
};

export default {
  loginController,
  registerController,
  refreshController,
  logoutController,
  getUserInformation,
  updateAvatar,
  updatePassword,
};
