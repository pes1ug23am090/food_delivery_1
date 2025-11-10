import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import CustomerDashboard from './components/customer/CustomerDashboard';
import RestaurantDashboard from './components/restaurant/RestaurantDashboard';
import DeliveryDashboard from './components/delivery/DeliveryDashboard';
import AdminDashboard from './components/admin/AdminDashboard';

function AppContent() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Auth />;
  }

  switch (profile.role) {
    case 'customer':
      return <CustomerDashboard />;
    case 'restaurant':
      return <RestaurantDashboard />;
    case 'delivery_agent':
      return <DeliveryDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <Auth />;
  }
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
