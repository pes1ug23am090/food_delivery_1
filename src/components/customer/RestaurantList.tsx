import { useState, useEffect } from 'react';
import { supabase, Restaurant } from '../../lib/supabase';
import { Star, MapPin, Clock } from 'lucide-react';

interface RestaurantListProps {
  onSelectRestaurant: (restaurant: Restaurant) => void;
}

export default function RestaurantList({ onSelectRestaurant }: RestaurantListProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      setRestaurants(data || []);
    } catch (error) {
      console.error('Error loading restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const cuisineTypes = ['all', ...Array.from(new Set(restaurants.map(r => r.cuisine_type).filter(Boolean)))];

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.cuisine_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCuisine = selectedCuisine === 'all' || restaurant.cuisine_type === selectedCuisine;
    return matchesSearch && matchesCuisine;
  });

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
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Browse Restaurants</h2>

        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search restaurants or cuisine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />

          <select
            value={selectedCuisine}
            onChange={(e) => setSelectedCuisine(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {cuisineTypes.map(cuisine => (
              <option key={cuisine} value={cuisine}>
                {cuisine === 'all' ? 'All Cuisines' : cuisine}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRestaurants.map(restaurant => (
          <button
            key={restaurant.id}
            onClick={() => onSelectRestaurant(restaurant)}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden text-left"
          >
            <div className="h-48 bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center">
              {restaurant.image_url ? (
                <img
                  src={restaurant.image_url}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-4xl font-bold">
                  {restaurant.name.charAt(0)}
                </span>
              )}
            </div>

            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{restaurant.name}</h3>

              {restaurant.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{restaurant.description}</p>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span>{restaurant.rating.toFixed(1)}</span>
                </div>

                {restaurant.cuisine_type && (
                  <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded-full text-xs">
                    {restaurant.cuisine_type}
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{restaurant.address}</span>
              </div>

              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>30-45 min delivery</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {filteredRestaurants.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No restaurants found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
