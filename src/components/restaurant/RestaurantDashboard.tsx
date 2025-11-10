import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase, Restaurant, Dish, Order } from "../../lib/supabase";
import { LogOut, Utensils, Package, Plus, Edit2, Trash2 } from "lucide-react";

interface OrderWithCustomer extends Order {
  profiles: {
    full_name: string;
    phone: string | null;
  };
}

export default function RestaurantDashboard() {
  const { profile, signOut } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [orders, setOrders] = useState<OrderWithCustomer[]>([]);
  const [view, setView] = useState<"orders" | "menu">("orders");
  const [showDishForm, setShowDishForm] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(true);

  const [dishForm, setDishForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    is_available: true,
  });

  useEffect(() => {
    loadRestaurant();
  }, [profile]);

  useEffect(() => {
    if (restaurant) {
      loadDishes();
      loadOrders();

      const subscription = supabase
        .channel("restaurant_orders")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "orders",
            filter: `restaurant_id=eq.${restaurant.id}`,
          },
          () => {
            loadOrders();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [restaurant]);

  const loadRestaurant = async () => {
    try {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("owner_id", profile!.id)
        .maybeSingle();

      if (error) throw error;
      setRestaurant(data);
    } catch (error) {
      console.error("Error loading restaurant:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDishes = async () => {
    if (!restaurant) return;

    try {
      const { data, error } = await supabase
        .from("dishes")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("category", { ascending: true });

      if (error) throw error;
      setDishes(data || []);
    } catch (error) {
      console.error("Error loading dishes:", error);
    }
  };

  const loadOrders = async () => {
    try {
      if (!restaurant || !restaurant.id) {
        console.warn("No restaurant yet, skipping loadOrders");
        return;
      }

      // select customer profile (profiles) so we can show customer name/phone
      const { data, error } = await supabase
        .from("orders")
        .select("*, profiles(full_name, phone)")
        .eq("restaurant_id", restaurant.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        return;
      }

      console.log("Orders fetched:", data);
      // ensure returned items match expected shape at render time
      const safeData = (data ?? []).map((o: any) => ({
        ...o,
        profiles: o.profiles || { full_name: "Customer", phone: null },
      }));

      setOrders(safeData as any);
    } catch (err) {
      console.error("Unexpected loadOrders error:", err);
    }
  };

  const saveDish = async () => {
    if (
      !restaurant ||
      !dishForm.name ||
      !dishForm.price ||
      !dishForm.category
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      if (editingDish) {
        const { error } = await supabase
          .from("dishes")
          .update({
            name: dishForm.name,
            description: dishForm.description,
            price: parseFloat(dishForm.price),
            category: dishForm.category,
            is_available: dishForm.is_available,
          })
          .eq("id", editingDish.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("dishes").insert({
          restaurant_id: restaurant.id,
          name: dishForm.name,
          description: dishForm.description,
          price: parseFloat(dishForm.price),
          category: dishForm.category,
          is_available: dishForm.is_available,
        });

        if (error) throw error;
      }

      setDishForm({
        name: "",
        description: "",
        price: "",
        category: "",
        is_available: true,
      });
      setEditingDish(null);
      setShowDishForm(false);
      loadDishes();
    } catch (error) {
      console.error("Error saving dish:", error);
      alert("Failed to save dish");
    }
  };

  const deleteDish = async (dishId: string) => {
    if (!confirm("Are you sure you want to delete this dish?")) return;

    try {
      const { error } = await supabase.from("dishes").delete().eq("id", dishId);

      if (error) throw error;
      loadDishes();
    } catch (error) {
      console.error("Error deleting dish:", error);
      alert("Failed to delete dish");
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (error) throw error;
      loadOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order status");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            No restaurant found for this account.
          </p>
          <button
            onClick={signOut}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Logout
          </button>
        </div>
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
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {restaurant.name}
                </h1>
                <p className="text-xs text-gray-600">Restaurant Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setView("orders")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  view === "orders"
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Package className="w-5 h-5" />
                Orders
              </button>

              <button
                onClick={() => setView("menu")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  view === "menu"
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Utensils className="w-5 h-5" />
                Menu
              </button>

              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === "orders" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl shadow-sm p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.id.slice(0, 8)}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Customer: {order.profiles.full_name}
                          {order.profiles.phone && ` • ${order.profiles.phone}`}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                          ${order.final_amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600 capitalize">
                          {order.status}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-sm text-gray-600 mb-3">
                        Delivery Address: {order.delivery_address}
                      </p>

                      <div className="flex flex-col gap-2">
                        {order.delivery_agent_id &&
                          order.status !== "delivered" && (
                            <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-xs text-blue-600 font-medium">
                                Delivery Agent assigned - Order in transit
                              </p>
                            </div>
                          )}

                        <div className="flex gap-2">
                          {order.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  updateOrderStatus(order.id, "accepted")
                                }
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() =>
                                  updateOrderStatus(order.id, "cancelled")
                                }
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {order.status === "accepted" && (
                            <button
                              onClick={() =>
                                updateOrderStatus(order.id, "preparing")
                              }
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                            >
                              Start Preparing
                            </button>
                          )}
                          {order.status === "preparing" && (
                            <button
                              onClick={() =>
                                updateOrderStatus(order.id, "ready")
                              }
                              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                            >
                              Mark Ready
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === "menu" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Menu Management
                </h2>
                <button
                  onClick={() => {
                    setShowDishForm(!showDishForm);
                    setEditingDish(null);
                    setDishForm({
                      name: "",
                      description: "",
                      price: "",
                      category: "",
                      is_available: true,
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Dish
                </button>
              </div>

              {showDishForm && (
                <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {editingDish ? "Edit Dish" : "Add New Dish"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Dish Name"
                      value={dishForm.name}
                      onChange={(e) =>
                        setDishForm({ ...dishForm, name: e.target.value })
                      }
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      value={dishForm.price}
                      onChange={(e) =>
                        setDishForm({ ...dishForm, price: e.target.value })
                      }
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Category"
                      value={dishForm.category}
                      onChange={(e) =>
                        setDishForm({ ...dishForm, category: e.target.value })
                      }
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg">
                      <input
                        type="checkbox"
                        checked={dishForm.is_available}
                        onChange={(e) =>
                          setDishForm({
                            ...dishForm,
                            is_available: e.target.checked,
                          })
                        }
                        className="text-orange-500 focus:ring-orange-500"
                      />
                      Available
                    </label>
                    <textarea
                      placeholder="Description"
                      value={dishForm.description}
                      onChange={(e) =>
                        setDishForm({
                          ...dishForm,
                          description: e.target.value,
                        })
                      }
                      rows={2}
                      className="md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={saveDish}
                      className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      {editingDish ? "Update" : "Add"} Dish
                    </button>
                    <button
                      onClick={() => {
                        setShowDishForm(false);
                        setEditingDish(null);
                        setDishForm({
                          name: "",
                          description: "",
                          price: "",
                          category: "",
                          is_available: true,
                        });
                      }}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dishes.map((dish) => (
                <div
                  key={dish.id}
                  className="bg-white rounded-xl shadow-sm p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {dish.name}
                      </h3>
                      {dish.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {dish.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingDish(dish);
                          setDishForm({
                            name: dish.name,
                            description: dish.description || "",
                            price: dish.price.toString(),
                            category: dish.category,
                            is_available: dish.is_available,
                          });
                          setShowDishForm(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteDish(dish.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-orange-600">
                      ${dish.price.toFixed(2)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          dish.is_available
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {dish.is_available ? "Available" : "Unavailable"}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {dish.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {dishes.length === 0 && !showDishForm && (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Utensils className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  No dishes yet. Add your first dish to get started!
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
