import { RouteHandler } from "fastify";
import Brand from "../models/brand.model";
import { ErrorResponse } from "../errors/ErrorResponse";

const handleGetBrands: RouteHandler = async (_, reply) => {
  const brands = await Brand.find().exec();
  return reply.send(brands);
};

const checkDuplicateBrandName = async (name: string, excludeId?: string) => {
  const category = await Brand.findOne({ name });
  if (category && category._id.toString() !== excludeId) {
    return true; // Duplicate found
  }
  return false;
};

const handleCreateBrand: RouteHandler<{
  Body: { name: string };
}> = async (request, reply) => {
  const { name } = request.body;

  const existingBrand = await checkDuplicateBrandName(name);
  if (existingBrand) {
    return ErrorResponse.sendError(reply, "Brand name already exists", 409);
  }

  const newBrand = new Brand({ name });
  await newBrand.save();
  return reply.code(201).send(newBrand);
};

const handleUpdateBrand: RouteHandler<{
  Params: { id: string };
  Body: { name: string };
}> = async (request, reply) => {
  const { id } = request.params;
  const { name } = request.body;

  const isDuplicate = await checkDuplicateBrandName(name, id);

  if (isDuplicate) {
    return ErrorResponse.sendError(reply, "Brand name already exists", 409);
  }

  const updatedBrand = await Brand.findByIdAndUpdate(
    id,
    { name },
    { new: true }
  );

  if (!updatedBrand) {
    return ErrorResponse.sendError(reply, "Brand not found", 404);
  }

  return reply.send(updatedBrand);
};

const handleDeleteBrand: RouteHandler<{ Params: { id: string } }> = async (
  request,
  reply
) => {
  const { id } = request.params;

  const deletedBrand = await Brand.findByIdAndDelete(id);
  if (!deletedBrand) {
    return ErrorResponse.sendError(reply, "Brand not found", 404);
  }

  return reply.send({ message: "Brand successfully deleted" });
};

const handleGetBrandById: RouteHandler<{ Params: { id: string } }> = async (
  request,
  reply
) => {
  const { id } = request.params;

  const brand = await Brand.findById(id);
  if (!brand) {
    return ErrorResponse.sendError(reply, "Brand not found", 404);
  }

  return reply.send(brand);
};

export default {
  handleGetBrands,
  handleCreateBrand,
  handleUpdateBrand,
  handleDeleteBrand,
  handleGetBrandById,
};
