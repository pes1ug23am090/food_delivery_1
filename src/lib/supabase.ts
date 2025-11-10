import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'customer' | 'restaurant' | 'delivery_agent' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Restaurant {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  address: string;
  phone: string;
  image_url: string | null;
  cuisine_type: string | null;
  rating: number;
  is_active: boolean;
  created_at: string;
}

export interface Dish {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
}

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface Order {
  id: string;
  customer_id: string;
  restaurant_id: string;
  delivery_agent_id: string | null;
  status: OrderStatus;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  delivery_address: string;
  payment_method: string;
  payment_status: PaymentStatus;
  estimated_delivery_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  dish_id: string;
  quantity: number;
  price: number;
  notes: string | null;
}

export interface Rating {
  id: string;
  order_id: string;
  customer_id: string;
  restaurant_id: string;
  rating: number;
  review: string | null;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount: number | null;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
}
