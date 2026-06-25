export interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  reviewsCount: number;
  category: string;
  description: string;
  specs: string[];
  image: string;
  stock: number;
  gender?: "Men" | "Women" | "Unisex";
  brand?: string;
  variations?: { color: string; image: string }[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: Date;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  discount: number;
  shipping: {
    fullName: string;
    email: string;
    address: string;
    city: string;
    zipCode: string;
    phone?: string;
  };
  date: string;
  status: "Processing" | "Shipped" | "Delivered";
  paymentStatus?: "Unpaid" | "Paid";
  stCourierId?: string;
  stCourierStatusLog?: { date: string; time: string; status: string; location: string }[];
}
