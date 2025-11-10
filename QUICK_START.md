# Quick Start Guide - Food Delivery System

## 🚀 Get Up and Running in 5 Minutes

### Step 1: Start the App
```bash
npm run dev
```
Visit: `http://localhost:5173`

---

## 📋 Create Test Accounts

Create these 4 accounts through the UI (Sign Up page):

| Role | Email | Password | Full Name |
|------|-------|----------|-----------|
| Restaurant | `restaurant@example.com` | `password123` | Pizza Palace |
| Customer | `customer@example.com` | `password123` | John Smith |
| Delivery Agent | `delivery@example.com` | `password123` | Mike Delivery |
| Admin | `admin@example.com` | `password123` | Admin User |

---

## 🍕 Setup Your First Restaurant

### Option A: Via Supabase Dashboard (Easiest)

1. Go to your Supabase project → **SQL Editor**
2. Copy and paste this script:

```sql
-- STEP 1: Get your restaurant owner's user ID
SELECT id, email FROM profiles WHERE email = 'restaurant@example.com';
-- Copy the 'id' value

-- STEP 2: Create restaurant (replace YOUR_USER_ID with the copied ID)
INSERT INTO restaurants (owner_id, name, description, address, phone, cuisine_type, is_active)
VALUES (
  'YOUR_USER_ID',
  'Pizza Palace',
  'Authentic Italian pizzas and pastas',
  '123 Main Street, Downtown',
  '+1-555-0101',
  'Italian',
  true
)
RETURNING id;
-- Copy the returned restaurant 'id'

-- STEP 3: Add dishes (replace RESTAURANT_ID with the copied ID from above)
INSERT INTO dishes (restaurant_id, name, description, price, category, is_available)
VALUES
  ('RESTAURANT_ID', 'Margherita Pizza', 'Classic tomato and mozzarella', 12.99, 'Pizza', true),
  ('RESTAURANT_ID', 'Pepperoni Pizza', 'Pepperoni and cheese', 14.99, 'Pizza', true),
  ('RESTAURANT_ID', 'Spaghetti Carbonara', 'Creamy pasta with bacon', 13.99, 'Pasta', true),
  ('RESTAURANT_ID', 'Caesar Salad', 'Romaine lettuce with dressing', 8.99, 'Salads', true),
  ('RESTAURANT_ID', 'Tiramisu', 'Coffee-flavored dessert', 6.99, 'Desserts', true),
  ('RESTAURANT_ID', 'Coca Cola', 'Soft drink', 2.99, 'Drinks', true);

-- STEP 4: Add discount coupons
INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, valid_until, is_active)
VALUES
  ('SAVE20', 'percentage', 20, 15.00, '2025-12-31 23:59:59', true),
  ('FIRST5', 'fixed', 5.00, 10.00, '2025-12-31 23:59:59', true);
```

### Option B: Via Restaurant Dashboard (After Restaurant is Created)

1. Sign in as `restaurant@example.com`
2. Click **"Menu"** tab
3. Click **"Add Dish"** button
4. Fill in the form and repeat for each dish

---

## 🎯 Test the Complete Workflow

### 1️⃣ Customer Places Order

Sign in as: `customer@example.com`

1. Browse restaurants
2. Click on **Pizza Palace**
3. Add items to cart (click **+** button)
4. Click **"Proceed to Checkout"**
5. Enter address: `"456 Oak Ave, Apt 2B"`
6. Select payment: **Credit Card**
7. Try coupon: `SAVE20`
8. Click **"Place Order"**

### 2️⃣ Restaurant Accepts Order

Sign in as: `restaurant@example.com`

1. Click **"Orders"** tab
2. See the new order
3. Click **"Accept"**
4. Click **"Start Preparing"**
5. Click **"Mark Ready"** (when food is ready)

### 3️⃣ Delivery Agent Delivers

Sign in as: `delivery@example.com`

1. See order in **"Available Deliveries"**
2. Click **"Accept Delivery"**
3. Order moves to **"My Active Deliveries"**
4. Click **"Mark Delivered"** (when delivered)

### 4️⃣ Admin Monitors

Sign in as: `admin@example.com`

- View real-time statistics
- Monitor all orders
- Track revenue and metrics

---

## 🎨 Adding More Content

### Add More Dishes via UI

1. Sign in as restaurant owner
2. Go to **Menu** tab
3. Click **"Add Dish"**
4. Fill in details:
   - Name, Price, Category, Description
   - Check "Available" box
5. Click **"Add Dish"**

### Add Multiple Dishes via SQL

```sql
-- Get your restaurant ID first
SELECT id, name FROM restaurants WHERE name = 'Pizza Palace';

-- Add dishes (replace RESTAURANT_ID)
INSERT INTO dishes (restaurant_id, name, description, price, category, is_available)
VALUES
  ('RESTAURANT_ID', 'Hawaiian Pizza', 'Ham and pineapple', 13.99, 'Pizza', true),
  ('RESTAURANT_ID', 'Veggie Supreme', 'All vegetables', 13.99, 'Pizza', true),
  ('RESTAURANT_ID', 'Fettuccine Alfredo', 'Cream sauce', 14.99, 'Pasta', true);
```

---

## 🏪 Add More Restaurants

### Create Another Restaurant

1. **Sign up a new restaurant owner**
   - Email: `burger@example.com`
   - Role: Restaurant

2. **Run SQL to create restaurant:**

```sql
-- Get new owner's ID
SELECT id FROM profiles WHERE email = 'burger@example.com';

-- Create restaurant (replace USER_ID)
INSERT INTO restaurants (owner_id, name, description, address, phone, cuisine_type, is_active)
VALUES (
  'USER_ID',
  'Burger Heaven',
  'Gourmet burgers and fries',
  '789 Pine Street',
  '+1-555-0102',
  'American',
  true
);
```

---

## 💡 Pro Tips

✅ **Real-time Updates**: All changes appear instantly across all dashboards

✅ **Order Flow**: Pending → Accepted → Preparing → Ready → Picked Up → Delivered

✅ **Coupons**: Test with codes `SAVE20` or `FIRST5`

✅ **Multiple Orders**: Place several orders to see the admin dashboard populate

✅ **Delivery Queue**: Orders must be "ready" before delivery agents can see them

---

## 🔍 Troubleshooting

**Can't see restaurant as customer?**
- Check `is_active = true` in restaurants table
- Ensure dishes have `is_available = true`

**Restaurant not showing in dashboard?**
- Verify restaurant's `owner_id` matches your user ID
- Check you're signed in with correct account

**No available deliveries?**
- Restaurant must mark order as "ready"
- Check order status in database

**Orders not appearing?**
- Verify `payment_status = 'completed'`
- Check `restaurant_id` is correct

---

## 📊 Database Quick Checks

```sql
-- See all users
SELECT email, role FROM profiles;

-- See all restaurants
SELECT name, is_active FROM restaurants;

-- Count dishes per restaurant
SELECT r.name, COUNT(d.id) as dishes
FROM restaurants r
LEFT JOIN dishes d ON r.id = d.restaurant_id
GROUP BY r.name;

-- See recent orders
SELECT id, status, final_amount, created_at
FROM orders
ORDER BY created_at DESC
LIMIT 10;

-- Active coupons
SELECT code, discount_value, discount_type
FROM coupons
WHERE is_active = true;
```

---

## 🎉 You're Ready!

Your food delivery platform is now fully operational with:
- ✅ Restaurant management
- ✅ Customer ordering
- ✅ Delivery tracking
- ✅ Admin analytics
- ✅ Real-time updates

**Need more help?** Check `SETUP_GUIDE.md` for detailed instructions or `seed_data.sql` for sample data scripts.
