import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [totalValue, setTotalValue] = useState(0);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchUserProfile();
    fetchInventoryValue();
    fetchTopProducts();
    fetchLowStock();
    fetchTotalCustomers();
  }, []);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchUserProfile = async () => {
    try {
      const res = await axios.get("http://localhost:3000/users/me", {
        headers,
      });
      setUsername(res.data.username);
      setProfilePic(res.data.profile_pic);
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  const fetchInventoryValue = async () => {
    try {
      const res = await axios.get("http://localhost:3000/inventory/value", {
        headers,
      });
      setTotalValue(res.data.total_value);
    } catch (err) {
      console.error("Error fetching inventory value:", err);
    }
  };

  const fetchTopProducts = async () => {
    try {
      const res = await axios.get("http://localhost:3000/inventory/top/units", {
        headers,
      });
      setTopProducts(res.data);
    } catch (err) {
      console.error("Error fetching top products:", err);
    }
  };

  const fetchLowStock = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/inventory/low-stock/5",
        { headers }
      );
      setLowStock(res.data);
    } catch (err) {
      console.error("Error fetching low stock:", err);
    }
  };

  const fetchTotalCustomers = async () => {
    try {
      const res = await axios.get("http://localhost:3000/customers", {
        headers,
      });
      setTotalCustomers(res.data.length);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-serif text-deep-purple">
      {/* Welcome Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">
          Welcome to Blandine Supermarket, {username}
        </h1>
        {profilePic && (
          <img
            src={`http://localhost:3000${profilePic}`}
            alt="Profile"
            className="w-16 h-16 rounded-full border-2 border-gray-300"
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => navigate("/inventory")}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Inventory
        </button>
        <button
          onClick={() => navigate("/customers")}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Customers
        </button>
        <button
          onClick={() => navigate("/sales")}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          Sales
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Total Inventory Value</h2>
          <p className="text-2xl font-bold">${totalValue}</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">
            Top Products (Units Sold)
          </h2>
          {topProducts.length > 0 ? (
            <ul className="list-disc ml-5">
              {topProducts.map((prod) => (
                <li key={prod.product_id}>
                  {prod.name} – {prod.units_sold} units
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No data available</p>
          )}
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Low Stock Products</h2>
          {lowStock.length > 0 ? (
            <ul className="list-disc ml-5">
              {lowStock.map((prod) => (
                <li key={prod.product_id}>
                  {prod.name} – {prod.stock} left
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">All stock levels are healthy</p>
          )}
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Total Customers</h2>
          <p className="text-2xl font-bold">{totalCustomers}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
