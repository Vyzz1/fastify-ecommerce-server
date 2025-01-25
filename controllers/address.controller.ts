import { RouteHandler } from "fastify";
import Address from "../models/address.model";

const addNewAddress: RouteHandler = async (req, reply) => {
  try {
    const userId = req.user?.id;

    const existingAdress = await Address.findOne({ user: userId }).exec();

    const address = new Address(req.body);

    address.user = userId;

    address.isDefault = existingAdress ? false : true;

    await address.save();

    return reply.code(201).send(address);
  } catch (error) {
    console.error("Error adding new address:", error);
    reply.status(500).send({ message: "Error adding new address" });
  }
};

const getAddressUser: RouteHandler = async (req, reply) => {
  try {
    const userId = req.user?.id;

    const address = await Address.find({ user: userId }).exec();

    return reply.send(address ?? []);
  } catch (error) {
    console.error("Error getting address:", error);
    throw new Error("Error getting address");
  }
};

const deleteAddress: RouteHandler<{ Params: { id: string } }> = async (
  req,
  reply
) => {
  try {
    const address = await Address.findByIdAndDelete(req.params.id).exec();

    if (!address) {
      return reply.status(404).send({ message: "Address not found" });
    }

    return reply.code(204).send();
  } catch (error) {
    throw new Error("Error deleting address");
  }
};

const updateAddress: RouteHandler<{
  Params: { id: string };
  Body: AddressRequest;
}> = async (req, reply) => {
  try {
    const address = await Address.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      lean: true,
    }).exec();

    if (!address) {
      return reply.status(404).send({ message: "Address not found" });
    }

    return reply.send(address);
  } catch (error) {
    throw new Error("Error updating address");
  }
};

const getSpecificAddress: RouteHandler<{ Params: { id: string } }> = async (
  request,
  reply
) => {
  try {
    const address = await Address.findById(request.params.id).exec();

    if (!address) {
      return reply.status(404).send({ message: "Address not found" });
    }

    return reply.send(address);
  } catch (error) {
    throw new Error("Error getting specific address");
  }
};

const setDefaultAddress: RouteHandler<{ Params: { id: string } }> = async (
  request,
  reply
) => {
  try {
    const userId = request.user?.id;

    const address = await Address.findById(request.params.id).exec();

    if (!address) {
      return reply.status(404).send({ message: "Address not found" });
    }

    await Address.updateMany({ user: userId }, { isDefault: false }).exec();

    address.isDefault = true;

    await address.save();

    return reply.send({ message: "Address updated successfully" });
  } catch (error) {
    console.log(error);
    throw new Error("Error setting default address");
  }
};

export default {
  getAddressUser,
  addNewAddress,
  deleteAddress,
  updateAddress,
  getSpecificAddress,
  setDefaultAddress,
};
