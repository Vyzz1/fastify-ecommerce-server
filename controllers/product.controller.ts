import { RouteHandler } from "fastify";
import Brand from "../models/brand.model";
import { ErrorResponse } from "../errors/ErrorResponse";
import Category from "../models/category.model";
import ProductColor from "../models/product-color.model";
import Product from "../models/product.model";
import ProductItem from "../models/product-item.model";

const handleCreateProduct: RouteHandler<{ Body: ProductRequest }> = async (
  req,
  res
) => {
  try {
    const brand = await Brand.findById(req.body.brandId).exec();
    if (!brand) {
      return ErrorResponse.sendError(res, "Brand not found", 404);
    }

    const category = await Category.findById(req.body.categoryId).exec();
    if (!category) {
      return ErrorResponse.sendError(res, "Category not found", 404);
    }

    const color = await ProductColor.findById(req.body.productColorId).exec();
    if (!color) {
      return ErrorResponse.sendError(res, "Color not found", 404);
    }

    const images = new Set(req.body.images);

    console.log(images);

    const newProduct = await Product.create({
      price: req.body.price,
      name: req.body.name,
      description: req.body.description,
      avatar: req.body.avatar,
      images: Array.from(images),
      showHomepage: false,

      brand: brand._id,
      category: category._id,
      productColor: color._id,
    });

    return res.code(201).send(newProduct);
  } catch (error) {
    console.log(error);
    return ErrorResponse.sendError(res, "error", 500);
  }
};

const handleUpdateProduct: RouteHandler<{
  Params: { id: string };
  Body: ProductRequest;
}> = async (request, reply) => {
  try {
    const { id } = request.params;

    let product = await Product.findById(id).exec();

    if (!product) {
      return ErrorResponse.sendError(reply, "Product not found", 404);
    }

    if (request.body.brandId !== product.brand.toString()) {
      const brand = await Brand.findById(request.body.brandId).exec();
      if (!brand) {
        return ErrorResponse.sendError(reply, "Not found", 404);
      }

      product.brand = brand._id;
    }

    if (request.body.categoryId !== product.category.toString()) {
      const category = await Category.findById(request.body.categoryId).exec();

      if (!category) {
        return ErrorResponse.sendError(reply, "Not found", 404);
      }
      product.category = category._id;
    }

    if (request.body.productColorId !== product.productColor.toString()) {
      const color = await ProductColor.findById(
        request.body.productColorId
      ).exec();
      if (!color) {
        return ErrorResponse.sendError(reply, "Not found", 404);
      }
      product.productColor = color._id;
    }

    product.name = request.body.name;
    product.price = request.body.price;

    product.description = request.body.description;

    product.avatar = request.body.avatar;
    product.images = request.body.images;

    await product.save();

    return reply.send(product.toJSON());
  } catch (error) {
    console.log(error);
    throw new Error("An error occurred");
  }
};

const handleGetAllProducts: RouteHandler = async (_, reply) => {
  try {
    const products = await Product.find()
      .select("-__v")
      .populate({
        path: "brand",
        select: "-__v",
      })
      .populate({
        path: "category",
        select: "-__v",
      })
      .populate({
        path: "productColor",
        select: "-__v",
      })
      .lean();

    return reply.send(
      products.map((product) => ({
        ...product,
        colorName: (product.productColor as any).value,
      }))
    );
  } catch (error) {
    console.log(error);
    throw new Error("An error occurred");
  }
};

const handleGetProductById: RouteHandler<{ Params: { id: string } }> = async (
  req,
  res
) => {
  try {
    const product = await Product.findById(req.params.id)
      .select("-__v")
      .populate({
        path: "brand",
        select: "-__v",
      })
      .populate({
        path: "category",
        select: "-__v",
      })
      .populate({
        path: "productColor",
        select: "-__v",
      })
      .populate({
        path: "productItems",
        select: "-__v",
        populate: {
          path: "productSize",
          model: "ProductSize",
          select: "-__v",
        },
      })
      .lean();

    if (!product) {
      return ErrorResponse.sendError(res, "Product not found", 404);
    }

    const sizes = product.productItems.map(
      (item) => ((item as any).productSize as any).value
    );

    return res.send({
      ...product,
      colorName: (product.productColor! as any).value,
      categoryId: (product.category! as any)._id,
      brandId: (product.brand! as any)._id,
      productColorId: (product.productColor! as any)._id,
      sizes,
    });
  } catch (error) {
    console.error(error);
    return ErrorResponse.sendError(res, "error", 500);
  }
};

const handleGetShowOnHomepage: RouteHandler = async (req, res) => {
  try {
    const products = await Product.find({ showHomepage: true })
      .select("-__v")
      .populate({
        path: "brand",
        select: "-__v",
      })
      .populate({
        path: "category",
        select: "-__v",
      })
      .populate({
        path: "productColor",
        select: "-__v",
      })
      .populate({
        path: "productItems",
        select: "-__v",
        populate: {
          path: "productSize",
          model: "ProductSize",
          select: "-__v",
        },
      })
      .lean();

    const transformedProducts = products.map((product) => {
      const sizes = (product.productItems as any[]).map(
        (item) => item.productSize.value
      );

      return {
        ...product,
        colorName: (product.productColor as any).value,
        sizes,
      };
    });

    return res.send(transformedProducts);
  } catch (error) {
    console.error(error);
    return ErrorResponse.sendError(res, "error", 500);
  }
};

const handleDeteleProduct: RouteHandler<{ Params: { id: string } }> = async (
  req,
  res
) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id).exec();

    if (!product) {
      return ErrorResponse.sendError(res, "Product not found", 404);
    }

    // delete all product items

    await ProductItem.deleteMany({ product: product._id }).exec();

    return res.send({ message: "Product deleted successfully" });
  } catch (error) {
    throw new Error("An error occurred");
  }
};

const handleUpdtateShowOnHomepage: RouteHandler<{
  Params: { id: string };
  Body: { showHomepage: boolean };
}> = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOneAndUpdate({ _id: id }, req.body, {
      new: true,
    }).exec();

    if (!product) {
      return ErrorResponse.sendError(res, "Product not found", 404);
    }

    return res.send(product);
  } catch (error) {
    console.log(error);
    throw new Error("An error occurred");
  }
};

const handleGetRelatedProducts: RouteHandler<{
  Params: { id: string };
}> = async (request, reply) => {
  try {
    const product = await Product.findById(request.params.id).exec();

    if (!product) {
      return ErrorResponse.sendError(reply, "Product not found", 404);
    }

    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    })
      .limit(4)
      .select("-__v")
      .populate({
        path: "brand",
        select: "-__v",
      })
      .populate({
        path: "category",
        select: "-__v",
      })
      .populate({
        path: "productColor",
        select: "-__v",
      })
      .populate({
        path: "productItems",
        select: "-__v",
        populate: {
          path: "productSize",
          model: "ProductSize",
          select: "-__v",
        },
      })
      .lean();

    const transformedProducts = relatedProducts.map((product) => {
      const sizes = (product.productItems as any[]).map(
        (item) => item.productSize.value
      );

      return {
        ...product,
        colorName: (product.productColor as any).value,
        sizes,
      };
    });

    return reply.send(transformedProducts);
  } catch (error) {
    console.log(error);
    throw new Error("An error occurred");
  }
};

export default {
  handleCreateProduct,
  handleUpdateProduct,
  handleGetProduct: handleGetProductById,
  handleGetShowOnHomepage,
  handleGetAllProducts,
  handleDeteleProduct,
  handleUpdtateShowOnHomepage,
  handleGetRelatedProducts,
};
