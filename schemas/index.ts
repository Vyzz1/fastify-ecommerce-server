export const errorResponseSchema = {
  message: { type: "string" },
  status: { type: "number" },
  timestamp: { type: "string" },
};

export const userSchema = {
  _id: { type: "string" },
  email: { type: "string" },
  firstName: { type: "string" },
  lastName: { type: "string" },
  role: { type: "string" },
  dob: { type: "string" },
  photoURL: { type: "string" },
  gender: { type: "string" },
};

export const categorySchema = {
  _id: { type: "string" },
  name: { type: "string" },
  image: { type: "string" },
};

export const brandSchema = {
  _id: { type: "string" },
  name: { type: "string" },
};

export const productVariantSchema = {
  _id: { type: "string" },
  value: { type: "string" },
};

export const errorResponse = {
  "4xx": { $ref: "ErrorResponse#" },
};

export const commonResponseSchema = (
  properties: Record<string, any>,
  status = 200,
  type = "object"
) => ({
  response: {
    [status]: {
      type: type,
      properties,
    },
    ...errorResponse,
  },
});

export const requiredIdParam = {
  params: {
    type: "object",
    properties: {
      id: { type: "string" },
    },
    required: ["id"],
  },
};

export const addressSchema = {
  _id: { type: "string" },
  fullName: { type: "string" },
  phoneNumber: { type: "string" },
  isDefault: { type: "boolean" },
  province: { type: "string" },
  district: { type: "string" },
  ward: { type: "string" },
  specify: { type: "string" },
};

export const smallProductSchema = {
  _id: { type: "string" },
  name: { type: "string" },
  avatar: { type: "string", format: "uri" },
  price: { type: "number" },
  productColor: {
    type: "object",
    properties: productVariantSchema,
  },
};

export const productItemSchema = {
  _id: { type: "string" },
  quantity: { type: "number" },
  productSize: {
    type: "object",
    properties: productVariantSchema,
  },
  product: {
    type: "object",
    properties: smallProductSchema,
  },
};

export const orderDetailSchema = {
  _id: { type: "string" },
  quantity: { type: "number" },
  productItem: {
    type: "object",
    properties: productItemSchema,
  },
};
export const orderSchema = {
  _id: { type: "string" },
  createdAt: { type: "string", format: "date-time" },
  user: { type: "string" },
  status: { type: "string" },
  orderDetails: {
    type: "array",
    items: {
      type: "object",
      properties: orderDetailSchema,
    },
  },
  address: { type: "string" },
  fullName: { type: "string" },
  phoneNumber: { type: "string" },
  specify: { type: "string" },
  total: { type: "number" },
  shippingFee: { type: "number" },
};
