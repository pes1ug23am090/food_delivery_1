-- /*
--   # Add OTP and Delivery Verification

--   1. New Column: `delivery_otp` 
--     - Stores OTP for delivery verification
--     - Generated when delivery agent marks order as "delivering"
--     - Verified by customer receiving food
  
--   2. New Column: `otp_verified_at`
--     - Timestamp when customer verifies OTP
--     - Used to mark order as fully delivered
  
--   3. Security
--     - RLS policies ensure customers can only verify their own orders
--     - Delivery agents can only set OTP for assigned orders
--     - Restaurants can see when delivery OTP is verified
-- */

-- -- Add OTP columns to orders table
-- DO $$
-- BEGIN
--   IF NOT EXISTS (
--     SELECT 1 FROM information_schema.columns
--     WHERE table_name = 'orders' AND column_name = 'delivery_otp'
--   ) THEN
--     ALTER TABLE orders ADD COLUMN delivery_otp text;
--   END IF;
  
--   IF NOT EXISTS (
--     SELECT 1 FROM information_schema.columns
--     WHERE table_name = 'orders' AND column_name = 'otp_verified_at'
--   ) THEN
--     ALTER TABLE orders ADD COLUMN otp_verified_at timestamptz;
--   END IF;
-- END $$;