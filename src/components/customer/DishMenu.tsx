import { useState, useEffect } from 'react';
import { supabase, Restaurant, Dish } from '../../lib/supabase';
import { ArrowLeft, Plus, Minus, ShoppingCart } from 'lucide-react';

interface CartItem {
  dish: Dish;
  quantity: number;
}

interface DishMenuProps {
  restaurant: Restaurant;
  onBack: () => void;
  onCheckout: (items: CartItem[], restaurant: Restaurant) => void;
}

export default function DishMenu({ restaurant, onBack, onCheckout }: DishMenuProps) {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadDishes();
  }, [restaurant.id]);

  const loadDishes = async () => {
    try {
      const { data, error } = await supabase
        .from('dishes')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .eq('is_available', true)
        .order('category', { ascending: true });

      if (error) throw error;
      setDishes(data || []);
    } catch (error) {
      console.error('Error loading dishes:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(dishes.map(d => d.category)))];

  const filteredDishes = selectedCategory === 'all'
    ? dishes
    : dishes.filter(d => d.category === selectedCategory);

  const addToCart = (dish: Dish) => {
    setCart(prev => {
      const existing = prev.find(item => item.dish.id === dish.id);
      if (existing) {
        return prev.map(item =>
          item.dish.id === dish.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { dish, quantity: 1 }];
    });
  };

  const removeFromCart = (dishId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.dish.id === dishId);
      if (existing && existing.quantity > 1) {
        return prev.map(item =>
          item.dish.id === dishId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prev.filter(item => item.dish.id !== dishId);
    });
  };

  const getCartQuantity = (dishId: string) => {
    const item = cart.find(item => item.dish.id === dishId);
    return item ? item.quantity : 0;
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Restaurants
        </button>

        <div className="flex items-start gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-400 rounded-lg flex items-center justify-center flex-shrink-0">
            {restaurant.image_url ? (
              <img
                src={restaurant.image_url}
                alt={restaurant.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <span className="text-white text-2xl font-bold">
                {restaurant.name.charAt(0)}
              </span>
            )}
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{restaurant.name}</h2>
            {restaurant.description && (
              <p className="text-gray-600 mt-1">{restaurant.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span>{restaurant.cuisine_type}</span>
              <span>•</span>
              <span>⭐ {restaurant.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'All Items' : category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDishes.map(dish => {
          const quantity = getCartQuantity(dish.id);
          return (
            <div
              key={dish.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="h-40 bg-gradient-to-br from-orange-200 to-red-200 flex items-center justify-center">
                {dish.image_url ? (
                  <img
                    src={dish.image_url}
                    alt={dish.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-3xl font-bold">
                    {dish.name.charAt(0)}
                  </span>
                )}
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">{dish.name}</h3>
                {dish.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{dish.description}</p>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xl font-bold text-orange-600">
                    ₹{dish.price.toFixed(2)}
                  </span>

                  {quantity === 0 ? (
                    <button
                      onClick={() => addToCart(dish)}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => removeFromCart(dish.id)}
                        className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-semibold text-gray-900 w-6 text-center">{quantity}</span>
                      <button
                        onClick={() => addToCart(dish)}
                        className="w-8 h-8 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ShoppingCart className="w-6 h-6 text-orange-500" />
              <div>
                <p className="font-semibold text-gray-900">
                  {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}
                </p>
                <p className="text-sm text-gray-600">
                  Total: ₹{getTotalAmount().toFixed(2)}
                </p>
              </div>
            </div>

            <button
              onClick={() => onCheckout(cart, restaurant)}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
