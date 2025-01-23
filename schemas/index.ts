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
