# Food Delivery System - Setup Guide

## Getting Started

### Step 1: Start the Application
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

## Initial Setup Process

### 1. Create User Accounts

The system supports 4 user roles. You need to create accounts for each role:

#### A. Create a Restaurant Owner Account
1. Open the application
2. Click "Sign up"
3. Fill in the details:
   - Full Name: "Pizza Palace"
   - Email: "restaurant@example.com"
   - Password: "password123"
   - Role: Select "Restaurant"
4. Click "Sign Up"

#### B. Create Restaurant Profile (First Time)
After signing up as a restaurant owner, you'll need to create your restaurant profile in the database:

**Option 1: Using Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to Table Editor → restaurants
3. Insert a new row with:
   - owner_id: [Your restaurant owner user ID]
   - name: "Pizza Palace"
   - description: "Authentic Italian pizzas and pastas"
   - address: "123 Main Street, Downtown"
   - phone: "+1234567890"
   - cuisine_type: "Italian"
   - is_active: true

**Option 2: Using SQL Editor**
```sql
-- Get your user ID first
SELECT id, email FROM profiles WHERE email = 'restaurant@example.com';

-- Insert restaurant (replace YOUR_USER_ID with the actual ID)
INSERT INTO restaurants (owner_id, name, description, address, phone, cuisine_type, is_active)
VALUES (
  'YOUR_USER_ID',
  'Pizza Palace',
  'Authentic Italian pizzas and pastas',
  '123 Main Street, Downtown',
  '+1234567890',
  'Italian',
  true
);
```

#### C. Create a Customer Account
1. Sign out from restaurant account
2. Click "Sign up"
3. Fill in:
   - Full Name: "John Smith"
   - Email: "customer@example.com"
   - Password: "password123"
   - Role: Select "Customer"
4. Click "Sign Up"

#### D. Create a Delivery Agent Account
1. Sign out
2. Click "Sign up"
3. Fill in:
   - Full Name: "Mike Delivery"
   - Email: "delivery@example.com"
   - Password: "password123"
   - Role: Select "Delivery Agent"
4. Click "Sign Up"

#### E. Create an Admin Account
1. Sign out
2. Click "Sign up"
3. Fill in:
   - Full Name: "Admin User"
   - Email: "admin@example.com"
   - Password: "password123"
   - Role: Select "Admin"
4. Click "Sign Up"

---

### 2. Add Dishes to Your Restaurant

1. Sign in with your restaurant account (restaurant@example.com)
2. Click on "Menu" tab in the navigation
3. Click "Add Dish" button
4. Fill in dish details:
   - Name: "Margherita Pizza"
   - Price: 12.99
   - Category: "Pizza"
   - Description: "Classic tomato and mozzarella pizza"
   - Available: ✓ (checked)
5. Click "Add Dish"

**Repeat this process to add more dishes:**
- Pepperoni Pizza - $14.99 - Pizza
- Spaghetti Carbonara - $13.99 - Pasta
- Caesar Salad - $8.99 - Salads
- Tiramisu - $6.99 - Desserts

---

### 3. Customer Orders Food

1. Sign out and sign in as customer (customer@example.com)
2. Browse restaurants on the home page
3. Click on "Pizza Palace" to view the menu
4. Add items to cart using the "+" button
5. Adjust quantities as needed
6. Click "Proceed to Checkout" at the bottom
7. Enter delivery address
8. Select payment method
9. Optionally enter a coupon code
10. Click "Place Order"

---

### 4. Restaurant Manages Orders

1. Sign in as restaurant owner (restaurant@example.com)
2. Click "Orders" tab
3. View incoming orders
4. Click "Accept" to accept an order
5. Click "Start Preparing" when you begin cooking
6. Click "Mark Ready" when the food is ready for pickup

---

### 5. Delivery Agent Delivers Order

1. Sign in as delivery agent (delivery@example.com)
2. View available deliveries (orders marked as "ready")
3. Click "Accept Delivery" on an order
4. The order will move to "My Active Deliveries"
5. View customer details and delivery address
6. Click "Mark Delivered" once delivered

---

### 6. Admin Monitors System

1. Sign in as admin (admin@example.com)
2. View dashboard with:
   - Total revenue
   - Total orders
   - Active customers
   - Restaurant count
   - Recent orders
3. Monitor system performance in real-time

---

## Creating Multiple Restaurants

To add more restaurants, you can use SQL:

```sql
-- First create a new restaurant owner account through the UI
-- Then get their user ID:
SELECT id, email FROM profiles WHERE email = 'newrestaurant@example.com';

-- Create the restaurant
INSERT INTO restaurants (owner_id, name, description, address, phone, cuisine_type, is_active)
VALUES (
  'NEW_OWNER_USER_ID',
  'Burger Heaven',
  'Gourmet burgers and fries',
  '456 Oak Avenue, Midtown',
  '+1234567891',
  'American',
  true
);
```

---

## Adding Sample Coupons

Use SQL to add discount coupons:

```sql
-- 20% off coupon
INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, valid_until, is_active)
VALUES (
  'SAVE20',
  'percentage',
  20,
  15.00,
  '2025-12-31 23:59:59',
  true
);

-- $5 off coupon
INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_discount, valid_until, is_active)
VALUES (
  'FIRST5',
  'fixed',
  5.00,
  10.00,
  5.00,
  '2025-12-31 23:59:59',
  true
);
```

---

## Bulk Adding Dishes

You can add multiple dishes at once using SQL:

```sql
-- Get your restaurant ID
SELECT id, name FROM restaurants WHERE name = 'Pizza Palace';

-- Add multiple dishes (replace RESTAURANT_ID with actual ID)
INSERT INTO dishes (restaurant_id, name, description, price, category, is_available)
VALUES
  ('RESTAURANT_ID', 'Margherita Pizza', 'Classic tomato and mozzarella', 12.99, 'Pizza', true),
  ('RESTAURANT_ID', 'Pepperoni Pizza', 'Pepperoni and cheese', 14.99, 'Pizza', true),
  ('RESTAURANT_ID', 'Hawaiian Pizza', 'Ham and pineapple', 13.99, 'Pizza', true),
  ('RESTAURANT_ID', 'Spaghetti Carbonara', 'Creamy pasta with bacon', 13.99, 'Pasta', true),
  ('RESTAURANT_ID', 'Penne Arrabbiata', 'Spicy tomato pasta', 12.99, 'Pasta', true),
  ('RESTAURANT_ID', 'Caesar Salad', 'Romaine lettuce with caesar dressing', 8.99, 'Salads', true),
  ('RESTAURANT_ID', 'Tiramisu', 'Coffee-flavored Italian dessert', 6.99, 'Desserts', true),
  ('RESTAURANT_ID', 'Panna Cotta', 'Italian cream dessert', 5.99, 'Desserts', true);
```

---

## Testing the Complete Flow

1. **Restaurant** adds dishes to menu
2. **Customer** browses restaurants and places order
3. **Restaurant** receives notification, accepts and prepares order
4. **Delivery Agent** sees available delivery, accepts it
5. **Customer** tracks order status in real-time
6. **Delivery Agent** marks order as delivered
7. **Admin** monitors all activities on dashboard

---

## Tips

- All users can see real-time updates without refreshing
- Customers can only order from active restaurants
- Delivery agents only see orders that are marked "ready"
- Restaurant owners can only manage their own restaurant
- Use meaningful addresses for testing delivery tracking
- Check the Admin dashboard for overall system insights

---

## Troubleshooting

**Can't see restaurants as customer?**
- Ensure restaurant is marked as `is_active = true`
- Make sure dishes are marked as `is_available = true`

**Orders not showing up?**
- Check that the order payment_status is 'completed'
- Verify restaurant_id matches in orders table

**Delivery agents see no orders?**
- Orders must be in 'ready' status to appear as available
- Make sure restaurant accepted and marked order as ready

---

## Quick Start SQL Script

Run this complete script in Supabase SQL Editor to set up everything:

```sql
-- Note: You must first create user accounts through the UI
-- This script assumes you have the user IDs

-- Example: Get all user IDs
SELECT id, email, role FROM profiles;

-- Then replace the IDs below with actual values and run each section
```
