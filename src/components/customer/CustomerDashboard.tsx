import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Restaurant, Dish } from '../../lib/supabase';
import RestaurantList from './RestaurantList';
import DishMenu from './DishMenu';
import Checkout from './Checkout';
import OrderTracking from './OrderTracking';
import { LogOut, Package, Home, User } from 'lucide-react';

type View = 'home' | 'menu' | 'checkout' | 'orders';

interface CartItem {
  dish: Dish;
  quantity: number;
}

export default function CustomerDashboard() {
  const { profile, signOut } = useAuth();
  const [view, setView] = useState<View>('home');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  const handleSelectRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setView('menu');
  };

  const handleCheckout = (items: CartItem[], restaurant: Restaurant) => {
    setCart(items);
    setSelectedRestaurant(restaurant);
    setView('checkout');
  };

  const handleOrderSuccess = () => {
    setCart([]);
    setSelectedRestaurant(null);
    setView('orders');
  };

  const handleBack = () => {
    if (view === 'menu') {
      setView('home');
      setSelectedRestaurant(null);
    } else if (view === 'checkout') {
      setView('menu');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 p-2 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Food Delivery</h1>
                <p className="text-xs text-gray-600">Welcome, {profile?.full_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setView('home')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  view === 'home'
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">Home</span>
              </button>

              <button
                onClick={() => setView('orders')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  view === 'orders'
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Package className="w-5 h-5" />
                <span className="hidden sm:inline">Orders</span>
              </button>

              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'home' && <RestaurantList onSelectRestaurant={handleSelectRestaurant} />}
        {view === 'menu' && selectedRestaurant && (
          <DishMenu
            restaurant={selectedRestaurant}
            onBack={handleBack}
            onCheckout={handleCheckout}
          />
        )}
        {view === 'checkout' && selectedRestaurant && (
          <Checkout
            cart={cart}
            restaurant={selectedRestaurant}
            onBack={handleBack}
            onSuccess={handleOrderSuccess}
          />
        )}
        {view === 'orders' && <OrderTracking />}
      </main>
    </div>
  );
}
