/*
  # Food Delivery Service System Database Schema

  ## Overview
  Complete database schema for a food delivery platform supporting customers, restaurants, 
  delivery agents, and administrators.

  ## New Tables
  
  ### 1. `profiles`
  - User profiles with role-based access
  
  ### 2. `restaurants`
  - Restaurant information and management
  
  ### 3. `dishes`
  - Menu items for restaurants
  
  ### 4. `orders`
  - Customer orders with status tracking
  
  ### 5. `order_items`
  - Individual items in orders
  
  ### 6. `delivery_tracking`
  - Real-time delivery tracking
  
  ### 7. `ratings`
  - Customer ratings and reviews
  
  ### 8. `coupons`
  - Discount coupons
  
  ## Security
  - RLS enabled on all tables
  - Role-based access control implemented
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'restaurant', 'delivery_agent', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can insert their profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);