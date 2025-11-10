import { useState } from "react";
import { supabase, Restaurant, Dish } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { ArrowLeft, MapPin, CreditCard, Check } from "lucide-react";

interface CartItem {
  dish: Dish;
  quantity: number;
}

interface CheckoutProps {
  cart: CartItem[];
  restaurant: Restaurant;
  onBack: () => void;
  onSuccess: () => void;
}

export default function Checkout({
  cart,
  restaurant,
  onBack,
  onSuccess,
}: CheckoutProps) {
  const { user } = useAuth();
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.dish.price * item.quantity,
    0
  );
  const finalAmount = subtotal - discount;

  const applyCoupon = async () => {
    if (!couponCode) return;

    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (error || !data) {
        alert("Invalid or expired coupon code");
        return;
      }

      if (subtotal < data.min_order_amount) {
        alert(`Minimum order amount of ₹${data.min_order_amount} required`);
        return;
      }

      let discountAmount = 0;
      if (data.discount_type === "percentage") {
        discountAmount = (subtotal * data.discount_value) / 100;
        if (data.max_discount) {
          discountAmount = Math.min(discountAmount, data.max_discount);
        }
      } else {
        discountAmount = data.discount_value;
      }

      setDiscount(discountAmount);
      alert("Coupon applied successfully!");
    } catch (error) {
      console.error("Error applying coupon:", error);
    }
  };

  const placeOrder = async () => {
    if (!deliveryAddress.trim()) {
      alert("Please enter delivery address");
      return;
    }

    if (!user) {
      alert("You must be logged in to place an order.");
      return;
    }

    setLoading(true);

    try {
      console.log("🧾 Order payload check:", {
        customer_id: user.id,
        restaurant_id: restaurant.id,
        subtotal,
        discount,
        finalAmount,
        delivery_address: deliveryAddress,
        payment_status: "completed",
        status: "pending",
      });

      // ✅ Insert order
      // Insert order with fields matching the Order interface used elsewhere
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            customer_id: user.id,
            restaurant_id: restaurant.id,
            total_amount: subtotal,
            discount_amount: discount,
            final_amount: finalAmount,
            delivery_address: deliveryAddress,
            payment_status: "completed",
            status: "pending",
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // ✅ Insert order items
      const orderItems = cart.map((item) => ({
        order_id: orderData.id,
        dish_id: item.dish.id,
        quantity: item.quantity,
        price: item.dish.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);
      if (itemsError) throw itemsError;

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (error: any) {
      console.error("❌ Error placing order:", error);
      alert("Failed to place order. Please check your console for details.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Order Placed Successfully!
          </h2>
          <p className="text-gray-600">
            Your food will arrive in approximately 45 minutes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Menu
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Order Summary
            </h3>
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.dish.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600">{item.quantity}x</span>
                    <span className="text-gray-900">{item.dish.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    ₹{(item.dish.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>₹{finalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Delivery Address
            </label>
            <textarea
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter your complete delivery address..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="w-4 h-4 inline mr-1" />
              Payment Method
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="text-orange-500 focus:ring-orange-500"
                />
                <span>Credit/Debit Card</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="cash"
                  checked={paymentMethod === "cash"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="text-orange-500 focus:ring-orange-500"
                />
                <span>Cash on Delivery</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coupon Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter coupon code"
              />
              <button
                onClick={applyCoupon}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Apply
              </button>
            </div>
          </div>

          <button
            onClick={placeOrder}
            disabled={loading}
            className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Placing Order..."
              : `Place Order - ₹${finalAmount.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
