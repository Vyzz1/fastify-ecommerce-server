import { RouteHandler } from "fastify";
import Brand from "../models/brand.model";
import { ErrorResponse } from "../errors/ErrorResponse";
import Category from "../models/category.model";
import ProductColor from "../models/product-color.model";
import Product from "../models/product.model";
import ProductItem from "../models/product-item.model";
import ProductSize from "../models/product-size.model";

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
    const {
      brandId,
      categoryId,
      productColorId,
      name,
      price,
      description,
      avatar,
      images,
    } = request.body;

    // Find the product
    const product = await Product.findById(id).exec();
    if (!product) {
      return ErrorResponse.sendError(reply, "Product not found", 404);
    }

    // Update brand if needed
    if (brandId && brandId !== product.brand?.toString()) {
      const brand = await Brand.findById(brandId).exec();
      if (!brand) {
        return ErrorResponse.sendError(reply, "Brand not found", 404);
      }
      product.brand = brand._id;
    }

    // Update category if needed
    if (categoryId && categoryId !== product.category?.toString()) {
      const category = await Category.findById(categoryId).exec();
      if (!category) {
        return ErrorResponse.sendError(reply, "Category not found", 404);
      }
      product.category = category._id;
    }

    // Update product color if needed
    if (productColorId && productColorId !== product.productColor?.toString()) {
      const color = await ProductColor.findById(productColorId).exec();
      if (!color) {
        return ErrorResponse.sendError(reply, "Product color not found", 404);
      }
      product.productColor = color._id;
    }

    // Update other fields
    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.avatar = avatar || product.avatar;
    product.images = images || product.images;

    await product.save();

    const updatedProduct = await product.populate([
      { path: "brand", select: "-__v" },
      { path: "category", select: "-__v" },
      { path: "productColor", select: "-__v" },
      {
        path: "productItems",
        select: "-__v",
        populate: {
          path: "productSize",
          model: "ProductSize",
          select: "-__v",
        },
      },
    ]);

    return reply.send({
      ...updatedProduct.toJSON(),
      colorName: (updatedProduct.productColor as any).value,
      categoryId: updatedProduct.category?._id,
      brandId: updatedProduct.brand?._id,
      productColorId: updatedProduct.productColor?._id,
      sizes: updatedProduct.productItems?.map(
        (item: any) => item.productSize?.value
      ),
    });
  } catch (error) {
    console.error(error);
    return ErrorResponse.sendError(reply, "An error occurred", 500);
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
      .sort({ createdAt: -1 })
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

    return res.send({ message: "Updated successfully" });
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

const handleSearchAutoComplete: RouteHandler<{
  Querystring: { name: string };
}> = async (req, res) => {
  try {
    const { name: productName } = req.query;

    if (!productName) {
      return ErrorResponse.sendError(res, "Name is required", 400);
    }

    const pipeline = [
      {
        $search: {
          index: "default",
          autocomplete: {
            query: productName,
            path: "name",
            fuzzy: {
              maxEdits: 2,
              prefixLength: 0,
              maxExpansions: 50,
            },
          },
        },
      },
    ];

    const products = await Product.aggregate(pipeline);

    return res.send(products);
  } catch (error) {
    throw new Error("An error occurred");
  }
};
const handleFilterProducts: RouteHandler<{
  Querystring: FilterCriteria;
}> = async (req, res) => {
  try {
    const criteria = req.query;

    // Xử lý size filter đầu tiên
    let sizeProductItemIds: any[] = [];
    if (criteria.size?.length) {
      // Bước 1: Tìm các ProductSize phù hợp
      const sizes = await ProductSize.find({
        value: { $in: criteria.size },
      })
        .select("_id")
        .lean();

      // Bước 2: Tìm các ProductItem liên quan
      const productItems = await ProductItem.find({
        productSize: { $in: sizes.map((s) => s._id) },
      })
        .select("_id")
        .lean();

      sizeProductItemIds = productItems.map((item) => item._id);
    }

    // Xây dựng query chính
    const query: any = {};

    // Category
    if (criteria.category && criteria.category !== "all") {
      query.category = criteria.category;
    }

    // Brand
    if (criteria.brand && criteria.brand !== "all") {
      query.brand = criteria.brand;
    }

    // Color
    if (criteria.color?.length) {
      query.productColor = { $in: criteria.color.split(",") };
    }

    // Keyword
    if (criteria.keyword) {
      query.name = { $regex: criteria.keyword, $options: "i" };
    }

    // Price range
    if (criteria.minPrice !== undefined || criteria.maxPrice !== undefined) {
      query.price = {};
      if (criteria.minPrice !== undefined) query.price.$gte = criteria.minPrice;
      if (criteria.maxPrice !== undefined) query.price.$lte = criteria.maxPrice;
    }

    // Size
    if (sizeProductItemIds.length) {
      query.productItems = { $in: sizeProductItemIds };
    }

    // Sorting
    const sortOptions: any = {};
    switch (criteria.sort) {
      case "Newest":
        sortOptions.createdAt = -1;
        break;
      case "PriceDESC":
        sortOptions.price = -1;
        break;
      case "PriceASC":
        sortOptions.price = 1;
        break;
      default:
        sortOptions.createdAt = -1;
    }

    // Pagination
    const page = criteria.page || 0;
    const limit = criteria.limit || 6;
    const skip = page * limit;

    // Thực hiện query với virtual populate
    const [products, total] = await Promise.all([
      Product.find(query)
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
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),

      Product.countDocuments(query),
    ]);

    // Lọc lại các product có ít nhất 1 product item hợp lệ

    const filteredProducts = products.filter((product) =>
      criteria.size?.length && criteria?.size !== undefined
        ? product.productItems.some(
            (item: any) =>
              item.productSize &&
              criteria!.size!.split(",").includes(item.productSize.value)
          )
        : true
    );

    // Tính toán phân trang
    const totalPages = Math.ceil(total / limit);
    const currentPage = page;

    const transformedProducts = filteredProducts.map((product) => ({
      ...product,
      colorName: (product.productColor as any).value,
      sizes: (product.productItems as any[]).map(
        (item) => item.productSize?.value
      ),
    }));

    return res.send({
      content: transformedProducts,
      total,
      page: currentPage,
      limit,
      totalPages,
      last: currentPage >= totalPages - 1,
      next: currentPage < totalPages - 1,
      pageable: {
        pageNumber: parseInt(currentPage.toString()),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal server error" });
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
  handleSearchAutoComplete,
  handleFilterProducts,
};
