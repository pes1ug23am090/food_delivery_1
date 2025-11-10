import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Order, Restaurant } from '../../lib/supabase';
import { LogOut, Truck, MapPin, Phone, Navigation, Copy, Check } from 'lucide-react';

interface OrderWithDetails extends Order {
  restaurants: Restaurant;
  profiles: {
    full_name: string;
    phone: string | null;
  };
}

export default function DeliveryDashboard() {
  const { profile, signOut } = useAuth();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [showingOtp, setShowingOtp] = useState<{ [key: string]: string }>({});
  const [copiedOtp, setCopiedOtp] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();

    const subscription = supabase
      .channel('delivery_orders')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `delivery_agent_id=eq.${profile!.id}`,
      }, () => {
        loadOrders();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [profile]);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, restaurants(*), profiles(full_name, phone)')
        .or(`delivery_agent_id.eq.${profile!.id},status.eq.ready`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptDelivery = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          delivery_agent_id: profile!.id,
          status: 'picked_up',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (error) throw error;

      const { error: trackingError } = await supabase
        .from('delivery_tracking')
        .insert({
          order_id: orderId,
          delivery_agent_id: profile!.id,
          status: 'picked_up',
        });

      if (trackingError) console.error('Error creating tracking:', trackingError);

      loadOrders();
    } catch (error) {
      console.error('Error accepting delivery:', error);
      alert('Failed to accept delivery');
    }
  };

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const updateDeliveryStatus = async (orderId: string, status: string) => {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'picked_up') {
        updateData.delivery_otp = generateOTP();
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      const { error: trackingError } = await supabase
        .from('delivery_tracking')
        .insert({
          order_id: orderId,
          delivery_agent_id: profile!.id,
          status,
        });

      if (trackingError) console.error('Error updating tracking:', trackingError);

      loadOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update delivery status');
    }
  };

  const copyOTPToClipboard = (otp: string) => {
    navigator.clipboard.writeText(otp);
    setCopiedOtp(otp);
    setTimeout(() => setCopiedOtp(null), 2000);
  };

  const availableOrders = orders.filter(o => o.status === 'ready' && !o.delivery_agent_id);
  const myOrders = orders.filter(o => o.delivery_agent_id === profile!.id && o.status !== 'delivered');
  const completedOrders = orders.filter(o => o.delivery_agent_id === profile!.id && o.status === 'delivered');

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 p-2 rounded-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Delivery Dashboard</h1>
                <p className="text-xs text-gray-600">Welcome, {profile?.full_name}</p>
              </div>
            </div>

            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-orange-600">{myOrders.length}</p>
              <p className="text-sm text-gray-600 mt-1">Active Deliveries</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">{availableOrders.length}</p>
              <p className="text-sm text-gray-600 mt-1">Available Orders</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">{completedOrders.length}</p>
              <p className="text-sm text-gray-600 mt-1">Completed Today</p>
            </div>
          </div>
        </div>

        {myOrders.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">My Active Deliveries</h2>
            {myOrders.map(order => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{order.id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {order.restaurants.name}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium capitalize">
                    {order.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Delivery Address</p>
                      <p className="text-sm text-gray-600">{order.delivery_address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Customer</p>
                      <p className="text-sm text-gray-600">
                        {order.profiles.full_name}
                        {order.profiles.phone && ` • ${order.profiles.phone}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <p className="text-lg font-bold text-gray-900">
                      ${order.final_amount.toFixed(2)}
                    </p>

                    <div className="flex flex-col gap-3 w-full">
                      {order.status === 'picked_up' && (
                        <>
                          {order.delivery_otp && (
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-xs text-blue-600 font-medium mb-1">Share this OTP with customer:</p>
                              <div className="flex items-center justify-between">
                                <p className="text-2xl font-bold text-blue-900 tracking-widest">{order.delivery_otp}</p>
                                <button
                                  onClick={() => copyOTPToClipboard(order.delivery_otp!)}
                                  className={`p-2 rounded-lg transition-colors ${
                                    copiedOtp === order.delivery_otp
                                      ? 'bg-green-100 text-green-600'
                                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                  }`}
                                >
                                  {copiedOtp === order.delivery_otp ? (
                                    <Check className="w-4 h-4" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                          <button
                            onClick={() => updateDeliveryStatus(order.id, 'delivered')}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center justify-center gap-2 w-full"
                          >
                            <Navigation className="w-4 h-4" />
                            Mark Delivered
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {availableOrders.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Available Deliveries</h2>
            {availableOrders.map(order => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{order.id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      From: {order.restaurants.name}
                    </p>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    ${order.final_amount.toFixed(2)}
                  </p>
                </div>

                <div className="flex items-start gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Delivery To</p>
                    <p className="text-sm text-gray-600">{order.delivery_address}</p>
                  </div>
                </div>

                <button
                  onClick={() => acceptDelivery(order.id)}
                  className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Truck className="w-5 h-5" />
                  Accept Delivery
                </button>
              </div>
            ))}
          </div>
        )}

        {myOrders.length === 0 && availableOrders.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No deliveries available at the moment</p>
          </div>
        )}
      </main>
    </div>
  );
}
