-- -- ============================================
-- -- FOOD DELIVERY SYSTEM - SEED DATA SCRIPT
-- -- ============================================
-- -- This script helps you populate the database with sample data
-- --
-- -- IMPORTANT: First create user accounts through the UI, then run this script
-- --
-- -- Steps:
-- -- 1. Create accounts via UI for: restaurant owner, customer, delivery agent, admin
-- -- 2. Get the user IDs by running: SELECT id, email, role FROM profiles;
-- -- 3. Replace the placeholder IDs below with actual user IDs
-- -- 4. Run this script in Supabase SQL Editor
-- -- ============================================

-- -- ============================================
-- -- STEP 1: VIEW EXISTING USERS
-- -- ============================================
-- -- Run this first to see all user IDs
-- SELECT id, email, full_name, role, created_at
-- FROM profiles
-- ORDER BY role, created_at;

-- -- ============================================
-- -- STEP 2: CREATE RESTAURANTS
-- -- ============================================
-- -- Replace 'RESTAURANT_OWNER_1_ID' with actual user ID of restaurant owner

-- -- Restaurant 1: Pizza Palace
-- INSERT INTO restaurants (owner_id, name, description, address, phone, cuisine_type, rating, is_active)
-- VALUES (
--   'RESTAURANT_OWNER_1_ID',  -- Replace with actual restaurant owner user ID
--   'Pizza Palace',
--   'Authentic Italian pizzas and pastas made with fresh ingredients',
--   '123 Main Street, Downtown, NY 10001',
--   '+1-555-0101',
--   'Italian',
--   4.5,
--   true
-- );

-- -- Restaurant 2: Burger Heaven
-- INSERT INTO restaurants (owner_id, name, description, address, phone, cuisine_type, rating, is_active)
-- VALUES (
--   'RESTAURANT_OWNER_2_ID',  -- Replace with actual restaurant owner user ID
--   'Burger Heaven',
--   'Gourmet burgers and hand-cut fries',
--   '456 Oak Avenue, Midtown, NY 10002',
--   '+1-555-0102',
--   'American',
--   4.3,
--   true
-- );

-- -- Restaurant 3: Sushi Master
-- INSERT INTO restaurants (owner_id, name, description, address, phone, cuisine_type, rating, is_active)
-- VALUES (
--   'RESTAURANT_OWNER_3_ID',  -- Replace with actual restaurant owner user ID
--   'Sushi Master',
--   'Fresh sushi and Japanese cuisine',
--   '789 Pine Street, Uptown, NY 10003',
--   '+1-555-0103',
--   'Japanese',
--   4.7,
--   true
-- );

-- -- ============================================
-- -- STEP 3: GET RESTAURANT IDs
-- -- ============================================
-- -- Run this to get the restaurant IDs for adding dishes
-- SELECT id, name, owner_id FROM restaurants;

-- -- ============================================
-- -- STEP 4: ADD DISHES FOR PIZZA PALACE
-- -- ============================================
-- -- Replace 'PIZZA_PALACE_ID' with actual restaurant ID

-- INSERT INTO dishes (restaurant_id, name, description, price, category, is_available)
-- VALUES
--   -- Pizzas
--   ('PIZZA_PALACE_ID', 'Margherita Pizza', 'Classic tomato sauce, fresh mozzarella, and basil', 12.99, 'Pizza', true),
--   ('PIZZA_PALACE_ID', 'Pepperoni Pizza', 'Loaded with pepperoni and extra cheese', 14.99, 'Pizza', true),
--   ('PIZZA_PALACE_ID', 'Hawaiian Pizza', 'Ham, pineapple, and mozzarella cheese', 13.99, 'Pizza', true),
--   ('PIZZA_PALACE_ID', 'Veggie Supreme', 'Bell peppers, mushrooms, onions, olives, tomatoes', 13.99, 'Pizza', true),
--   ('PIZZA_PALACE_ID', 'Meat Lovers', 'Pepperoni, sausage, bacon, and ham', 16.99, 'Pizza', true),

--   -- Pasta
--   ('PIZZA_PALACE_ID', 'Spaghetti Carbonara', 'Creamy pasta with bacon and parmesan', 13.99, 'Pasta', true),
--   ('PIZZA_PALACE_ID', 'Penne Arrabbiata', 'Spicy tomato sauce with garlic', 12.99, 'Pasta', true),
--   ('PIZZA_PALACE_ID', 'Fettuccine Alfredo', 'Rich cream sauce with parmesan', 14.99, 'Pasta', true),
--   ('PIZZA_PALACE_ID', 'Lasagna', 'Layered pasta with meat sauce and cheese', 15.99, 'Pasta', true),

--   -- Salads
--   ('PIZZA_PALACE_ID', 'Caesar Salad', 'Romaine lettuce with caesar dressing and croutons', 8.99, 'Salads', true),
--   ('PIZZA_PALACE_ID', 'Caprese Salad', 'Fresh mozzarella, tomatoes, and basil', 9.99, 'Salads', true),

--   -- Desserts
--   ('PIZZA_PALACE_ID', 'Tiramisu', 'Coffee-flavored Italian dessert', 6.99, 'Desserts', true),
--   ('PIZZA_PALACE_ID', 'Panna Cotta', 'Creamy Italian custard', 5.99, 'Desserts', true),

--   -- Drinks
--   ('PIZZA_PALACE_ID', 'Coca Cola', 'Classic soft drink', 2.99, 'Drinks', true),
--   ('PIZZA_PALACE_ID', 'San Pellegrino', 'Sparkling water', 3.99, 'Drinks', true);

-- -- ============================================
-- -- STEP 5: ADD DISHES FOR BURGER HEAVEN
-- -- ============================================
-- -- Replace 'BURGER_HEAVEN_ID' with actual restaurant ID

-- INSERT INTO dishes (restaurant_id, name, description, price, category, is_available)
-- VALUES
--   -- Burgers
--   ('BURGER_HEAVEN_ID', 'Classic Burger', 'Beef patty with lettuce, tomato, onion, pickles', 10.99, 'Burgers', true),
--   ('BURGER_HEAVEN_ID', 'Cheeseburger', 'Classic burger with melted cheddar cheese', 11.99, 'Burgers', true),
--   ('BURGER_HEAVEN_ID', 'Bacon Burger', 'Loaded with crispy bacon and cheese', 13.99, 'Burgers', true),
--   ('BURGER_HEAVEN_ID', 'Mushroom Swiss Burger', 'Sautéed mushrooms and Swiss cheese', 13.49, 'Burgers', true),
--   ('BURGER_HEAVEN_ID', 'Veggie Burger', 'Plant-based patty with all the fixings', 11.99, 'Burgers', true),

--   -- Sides
--   ('BURGER_HEAVEN_ID', 'French Fries', 'Crispy hand-cut fries', 4.99, 'Sides', true),
--   ('BURGER_HEAVEN_ID', 'Onion Rings', 'Beer-battered onion rings', 5.99, 'Sides', true),
--   ('BURGER_HEAVEN_ID', 'Sweet Potato Fries', 'Crispy sweet potato fries', 5.99, 'Sides', true),
--   ('BURGER_HEAVEN_ID', 'Mozzarella Sticks', 'Breaded and fried mozzarella', 6.99, 'Sides', true),

--   -- Drinks
--   ('BURGER_HEAVEN_ID', 'Milkshake - Chocolate', 'Creamy chocolate milkshake', 5.99, 'Drinks', true),
--   ('BURGER_HEAVEN_ID', 'Milkshake - Vanilla', 'Classic vanilla milkshake', 5.99, 'Drinks', true),
--   ('BURGER_HEAVEN_ID', 'Lemonade', 'Fresh squeezed lemonade', 3.99, 'Drinks', true);

-- -- ============================================
-- -- STEP 6: ADD DISHES FOR SUSHI MASTER
-- -- ============================================
-- -- Replace 'SUSHI_MASTER_ID' with actual restaurant ID

-- INSERT INTO dishes (restaurant_id, name, description, price, category, is_available)
-- VALUES
--   -- Sushi Rolls
--   ('SUSHI_MASTER_ID', 'California Roll', 'Crab, avocado, and cucumber', 8.99, 'Rolls', true),
--   ('SUSHI_MASTER_ID', 'Spicy Tuna Roll', 'Fresh tuna with spicy mayo', 10.99, 'Rolls', true),
--   ('SUSHI_MASTER_ID', 'Dragon Roll', 'Eel, cucumber, avocado on top', 14.99, 'Rolls', true),
--   ('SUSHI_MASTER_ID', 'Rainbow Roll', 'California roll topped with assorted fish', 13.99, 'Rolls', true),
--   ('SUSHI_MASTER_ID', 'Philadelphia Roll', 'Salmon, cream cheese, cucumber', 9.99, 'Rolls', true),

--   -- Nigiri
--   ('SUSHI_MASTER_ID', 'Salmon Nigiri', 'Two pieces of fresh salmon', 6.99, 'Nigiri', true),
--   ('SUSHI_MASTER_ID', 'Tuna Nigiri', 'Two pieces of fresh tuna', 7.99, 'Nigiri', true),
--   ('SUSHI_MASTER_ID', 'Eel Nigiri', 'Two pieces of grilled eel', 8.99, 'Nigiri', true),

--   -- Appetizers
--   ('SUSHI_MASTER_ID', 'Edamame', 'Steamed soybeans with sea salt', 4.99, 'Appetizers', true),
--   ('SUSHI_MASTER_ID', 'Miso Soup', 'Traditional Japanese soup', 3.99, 'Appetizers', true),
--   ('SUSHI_MASTER_ID', 'Gyoza', 'Pan-fried pork dumplings', 6.99, 'Appetizers', true);

-- -- ============================================
-- -- STEP 7: ADD DISCOUNT COUPONS
-- -- ============================================

-- INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_discount, valid_until, is_active)
-- VALUES
--   -- 20% off for orders over $15
--   ('SAVE20', 'percentage', 20, 15.00, 10.00, '2025-12-31 23:59:59', true),

--   -- $5 off for first order
--   ('FIRST5', 'fixed', 5.00, 10.00, 5.00, '2025-12-31 23:59:59', true),

--   -- 10% off any order
--   ('WELCOME10', 'percentage', 10, 0.00, 5.00, '2025-12-31 23:59:59', true),

--   -- $10 off orders over $30
--   ('BIG10', 'fixed', 10.00, 30.00, 10.00, '2025-12-31 23:59:59', true);

-- -- ============================================
-- -- STEP 8: VERIFY DATA
-- -- ============================================

-- -- Check restaurants
-- SELECT id, name, cuisine_type, rating, is_active FROM restaurants;

-- -- Check dishes count per restaurant
-- SELECT r.name as restaurant, COUNT(d.id) as dish_count
-- FROM restaurants r
-- LEFT JOIN dishes d ON r.id = d.restaurant_id
-- GROUP BY r.name;

-- -- Check active coupons
-- SELECT code, discount_type, discount_value, min_order_amount FROM coupons WHERE is_active = true;

-- -- Check all users by role
-- SELECT role, COUNT(*) as count FROM profiles GROUP BY role;

-- -- ============================================
-- -- QUICK REFERENCE - Test Accounts
-- -- ============================================
-- -- After creating accounts through UI, use these credentials:
-- --
-- -- Restaurant Owner: restaurant@example.com / password123
-- -- Customer: customer@example.com / password123
-- -- Delivery Agent: delivery@example.com / password123
-- -- Admin: admin@example.com / password123
-- -- ============================================
