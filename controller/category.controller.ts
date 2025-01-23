import { RouteHandler } from "fastify";
import Category from "../models/category.model";
import { ErrorResponse } from "../errors/ErrorResponse";

const checkDuplicateCategoryName = async (name: string, excludeId?: string) => {
  const category = await Category.findOne({ name });
  if (category && category._id.toString() !== excludeId) {
    return true; // Duplicate found
  }
  return false;
};

const handleGetCategories: RouteHandler = async (_, reply) => {
  const categories = await Category.find().exec();
  return reply.send(categories);
};

const handleCreateCategory: RouteHandler<{ Body: ProductParents }> = async (
  request,
  reply
) => {
  const { name, image } = request.body;

  const isDuplicate = await checkDuplicateCategoryName(name);
  if (isDuplicate) {
    return ErrorResponse.sendError(reply, "Category name already exists", 409);
  }

  const newCategory = new Category({
    name,
    image,
  });

  await newCategory.save();
  return reply.code(201).send(newCategory);
};

const handleUpdateCategory: RouteHandler<{
  Params: { id: string };
  Body: ProductParents;
}> = async (request, reply) => {
  const { id } = request.params;
  const { name, image } = request.body;

  const isDuplicate = await checkDuplicateCategoryName(name, id);

  if (isDuplicate) {
    return ErrorResponse.sendError(reply, "Category name already exists", 409);
  }

  const updatedCategory = await Category.findByIdAndUpdate(
    id,
    { name, image },
    { new: true }
  );

  if (!updatedCategory) {
    return ErrorResponse.sendError(reply, "Category not found", 404);
  }

  return reply.send(updatedCategory);
};

const handleDeleteCategory: RouteHandler<{ Params: { id: string } }> = async (
  request,
  reply
) => {
  const { id } = request.params;

  const deletedCategory = await Category.findByIdAndDelete(id);

  if (!deletedCategory) {
    return ErrorResponse.sendError(reply, "Category not found", 404);
  }

  return reply.send({ message: "Category successfully deleted" });
};

const handleGetCategoryById: RouteHandler<{ Params: { id: string } }> = async (
  request,
  reply
) => {
  const { id } = request.params;

  const category = await Category.findById(id).exec();

  if (!category) {
    return ErrorResponse.sendError(reply, "Category not found", 404);
  }

  return reply.send(category);
};

export default {
  handleGetCategories,
  handleCreateCategory,
  handleUpdateCategory,
  handleDeleteCategory,
  handleGetCategoryById,
};
