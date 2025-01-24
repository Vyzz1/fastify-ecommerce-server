type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  dob?: Date;
};

interface LoginRequest {
  email: string;
  password: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

interface ProductParents {
  name: string;
  image?: string;
}

interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

interface ProductVariants {
  _id: string;
  value: string;
}

interface UserJWTPayload {
  email: string;
  role: string;
  id: string;
}

interface AddressRequest {
  province: string;
  district: string;
  ward: string;
  specify: string;
  fullName: string;
  phoneNumber: string;
}

interface OrderRequest {
  address: AddressRequest;
  total: number;
  shippingFee: number;
  orderDetails: OrderDetailsRequest[];
}

interface OrderDetailsRequest {
  productItemId: string;
  quantity: number;
}

interface ProductItemRequest {
  _id: string;
  quantity: number;
  productSizeId: string;
}

interface CartRequest {
  productItemId: string;
  quantity: number;
}
