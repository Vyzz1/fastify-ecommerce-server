import { RouteHandler, RouteHandlerMethod } from "fastify";
import { ErrorResponse } from "../errors/ErrorResponse";
import jwt from "jsonwebtoken";

import bcrypt from "bcrypt";
import User from "../models/user.model";
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
    { email: user.email, role: user.role, id: user._id },
    process.env.ACCESS_TOKEN!,
    { expiresIn: "8m" }
  );

  const refreshToken = jwt.sign(
    { email: user.email },
    process.env.REFRESH_TOKEN!,
    { expiresIn: "1d" }
  );

  await User.findOneAndUpdate(
    { email: user.email },
    { refreshToken },
    { new: true }
  ).exec();

  const response = {
    ...user.toJSON(),
    token: accessToken,
    name: user.firstName + " " + user.lastName,
  };

  reply
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",

      maxAge: 1000 * 60 * 60 * 24,
      path: "/",
    })
    .send(response);
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
      role: "ROLE_USER",
    });

    reply.status(201).send(newUser);
  } catch (error) {
    console.log(error);
    throw new Error("Error");
  }
};

const refreshController: RouteHandler = async (request, reply) => {
  if (!request.cookies.refreshToken) {
    console.log("No refresh token");
    ErrorResponse.sendError(reply, "Unauthorized", 401);
  }

  const refreshToken = request.cookies.refreshToken;

  jwt.verify(refreshToken!, process.env.REFRESH_TOKEN!, (err, user) => {
    if (err) {
      return ErrorResponse.sendError(reply, "Expired", 401);
    }
  });

  const user = await User.findOne({ refreshToken }).exec();

  if (!user) {
    console.log("No user found");
    return ErrorResponse.sendError(reply, "Unauthorized", 401);
  }

  const accessToken = jwt.sign(
    { email: user.email, role: user.role, id: user._id },

    process.env.ACCESS_TOKEN!,
    { expiresIn: "8m" }
  );

  reply.send({ accessToken });
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

  const user = await User.updateOne(
    { refreshToken },
    { $unset: { refreshToken: 1 } }
  ).exec();

  console.log(user);

  reply.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24,
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

const updateUserInformation: RouteHandler<{ Body: User }> = async (
  request,
  reply
) => {
  const email = request.user?.email;

  if (!email) {
    return ErrorResponse.sendError(reply, "Unauthorized", 401);
  }

  const user = await User.findOneAndUpdate({ email }, request.body, {
    new: true,
  }).exec();

  if (!user) {
    return ErrorResponse.sendError(reply, "User not found", 400);
  }

  return reply.send(user);
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

const handleUpdateAvatar: RouteHandler<{ Body: { photoUrl: string } }> = async (
  req,
  res
) => {
  try {
    const id = req.user?.id;

    const user = await User.findOneAndUpdate(
      { _id: id },
      { photoURL: req.body.photoUrl },
      { new: true }
    ).exec();

    if (!user) {
      return ErrorResponse.sendError(res, "User not found", 404);
    }

    return res.send({ photoURL: user.photoURL });
  } catch (error) {
    throw new Error("An error occurred");
  }
};

const handleGetAllUser: RouteHandler = async (req, res) => {
  try {
    if (req.user?.role !== "ROLE_ADMIN") {
      return ErrorResponse.sendError(res, "Unauthorized", 401);
    }
    const users = await User.find({
      role: {
        $ne: "ROLE_ADMIN",
      },
    })
    .exec();

    return res.send(users);
  } catch (error) {
    throw new Error("An error occurred");
  }
};

const handleDeleteUserById: RouteHandler<{ Params: { id: string } }> = async (
  req,
  res
) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id).exec();

    if (!user) {
      return ErrorResponse.sendError(res, "User not found", 404);
    }

    return res.code(204).send();
  } catch (error) {
    throw new Error("An error occurred");
  }
};

export default {
  loginController,
  registerController,
  refreshController,
  logoutController,
  getUserInformation,
  updatePassword,
  updateUserInformation,
  handleUpdateAvatar,
  handleGetAllUser,
  handleDeleteUserById,
};
