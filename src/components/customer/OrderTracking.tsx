import { useState, useEffect } from 'react';
import { supabase, Order, Restaurant } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Package, Clock, CheckCircle, XCircle, Lock } from 'lucide-react';

interface OrderWithRestaurant extends Order {
  restaurants: Restaurant;
  delivery_otp?: string;
  otp_verified_at?: string;
}

export default function OrderTracking() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderWithRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyingOtp, setVerifyingOtp] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');

  useEffect(() => {
    loadOrders();

    const subscription = supabase
      .channel('order_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `customer_id=eq.${user!.id}`,
      }, () => {
        loadOrders();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, restaurants(*)')
        .eq('customer_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return CheckCircle;
      case 'cancelled': return XCircle;
      default: return Package;
    }
  };

  const verifyOTP = async (orderId: string, order: OrderWithRestaurant) => {
    if (!otpInput.trim()) {
      setOtpError('Please enter OTP');
      return;
    }

    try {
      if (otpInput !== order.delivery_otp) {
        setOtpError('Invalid OTP. Please try again.');
        return;
      }

      const { error } = await supabase
        .from('orders')
        .update({
          status: 'delivered',
          otp_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (error) throw error;

      setVerifyingOtp(null);
      setOtpInput('');
      setOtpError('');
      loadOrders();
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setOtpError('Failed to verify OTP. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
        <p className="text-gray-600">Start ordering from your favorite restaurants!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">My Orders</h2>
      </div>

      <div className="space-y-4">
        {orders.map(order => {
          const StatusIcon = getStatusIcon(order.status);
          return (
            <div key={order.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-400 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xl font-bold">
                      {order.restaurants.name.charAt(0)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {order.restaurants.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Order #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(order.created_at).toLocaleDateString()} at{' '}
                      {new Date(order.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                  <StatusIcon className="w-4 h-4" />
                  <span className="text-sm font-medium capitalize">{order.status}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    {order.estimated_delivery_time && (
                      <span>
                        ETA: {new Date(order.estimated_delivery_time).toLocaleTimeString()}
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-gray-600">Total Amount</p>
                    <p className="text-xl font-bold text-gray-900">
                      ${order.final_amount.toFixed(2)}
                    </p>
                  </div>
                </div>

                {order.delivery_address && (
                  <p className="text-sm text-gray-600 mt-3">
                    Delivery to: {order.delivery_address}
                  </p>
                )}

                {order.status === 'picked_up' && !order.otp_verified_at && (
                  <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                    {verifyingOtp === order.id ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          <Lock className="w-4 h-4 inline mr-2" />
                          Enter OTP from delivery agent:
                        </label>
                        <input
                          type="text"
                          value={otpInput}
                          onChange={(e) => {
                            setOtpInput(e.target.value);
                            setOtpError('');
                          }}
                          placeholder="Enter 6-digit OTP"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent mb-2"
                          maxLength={6}
                        />
                        {otpError && (
                          <p className="text-sm text-red-600 mb-2">{otpError}</p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => verifyOTP(order.id, order)}
                            className="flex-1 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                          >
                            Verify OTP
                          </button>
                          <button
                            onClick={() => {
                              setVerifyingOtp(null);
                              setOtpInput('');
                              setOtpError('');
                            }}
                            className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-orange-800">
                          Your food is on the way! Ask delivery agent for OTP.
                        </p>
                        <button
                          onClick={() => setVerifyingOtp(order.id)}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                        >
                          Have OTP?
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {order.otp_verified_at && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-800">Order delivered successfully!</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
