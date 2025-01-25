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
  status = 200
) => ({
  response: {
    [status]: {
      type: "object",
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
