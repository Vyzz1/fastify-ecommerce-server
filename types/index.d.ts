interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  dob?: Date;
}

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

interface ProductRequest {
  id: number;
  name: string;
  description: string;
  avatar: string;
  images: string[];
  categoryId: string;
  brandId: string;
  price: number;
  productColorId: string;
  colorName: string;
  sizes: string[];
  showHomepage: boolean;
}

enum SortType {
  Newest,
  PriceDESC,
  PriceASC,
}
interface FilterCriteria {
  category?: string;
  brand?: string;
  color?: number[]; // List<Long> -> number[]
  size?: string[]; // List<String> -> string[]
  keyword?: string;
  minPrice?: number; // Double -> number
  maxPrice?: number; // Double -> number
  sort?: SortType;
  page?: number; // Default value can be assigned when used
  limit?: number; // Default value can be assigned when used
}
