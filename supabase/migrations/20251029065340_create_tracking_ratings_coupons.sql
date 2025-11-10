/*
  # Create Delivery Tracking, Ratings, and Coupons Tables

  ## New Tables
  
  ### `delivery_tracking`
  - Real-time delivery location and status tracking
  - Updated by delivery agents
  
  ### `ratings`
  - Customer ratings and reviews for restaurants
  - Linked to completed orders
  
  ### `coupons`
  - Discount codes for customer orders
  - Validity and usage constraints
  
  ## Security
  - Appropriate RLS policies for each user role
  - Public can view ratings and active coupons
*/

-- Create delivery_tracking table
CREATE TABLE IF NOT EXISTS delivery_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  delivery_agent_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL,
  current_location text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE delivery_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tracking for their orders"
  ON delivery_tracking FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = delivery_tracking.order_id
      AND (orders.customer_id = auth.uid() OR orders.delivery_agent_id = auth.uid())
    )
  );

CREATE POLICY "Delivery agents can update tracking"
  ON delivery_tracking FOR ALL
  TO authenticated
  USING (delivery_agent_id = auth.uid())
  WITH CHECK (delivery_agent_id = auth.uid());

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  customer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ratings"
  ON ratings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Customers can create ratings for their orders"
  ON ratings FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL CHECK (discount_value > 0),
  min_order_amount numeric DEFAULT 0 CHECK (min_order_amount >= 0),
  max_discount numeric,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz NOT NULL,
  is_active boolean DEFAULT true
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active coupons"
  ON coupons FOR SELECT
  TO authenticated
  USING (is_active = true AND valid_until > now());

CREATE INDEX IF NOT EXISTS idx_ratings_restaurant ON ratings(restaurant_id);