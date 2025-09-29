import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import SalesTable from "../components/SalesTable";

const BASE_URL = "http://localhost:3000";

const Sales = () => {
  const [customers, setCustomers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [sales, setSales] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/customers`, { headers });
      setCustomers(res.data);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError("Failed to load customers");
    }
  }, [token]);

  // Fetch inventory
  const fetchInventory = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/inventory`, { headers });
      setInventory(res.data);
    } catch (err) {
      console.error("Error fetching inventory:", err);
      setError("Failed to load inventory");
    }
  }, [token]);

  // Fetch sales
  const fetchSales = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/sales`, { headers });
      setSales(res.data);
    } catch (err) {
      console.error("Error fetching sales:", err);
      setError("Failed to load sales");
    }
  }, [token]);

  // Load all data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCustomers(), fetchInventory(), fetchSales()]);
      setLoading(false);
    };
    loadData();
  }, [fetchCustomers, fetchInventory, fetchSales]);

  // Add product line
  const addItem = () => {
    setItems([...items, { product_id: "", quantity: 1, price: 0 }]);
  };

  // Update product line
  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    if (field === "product_id" || field === "quantity") {
      const product = inventory.find(
        (p) => p.product_id == updated[index].product_id
      );
      updated[index].price = product ? product.price : 0;
    }

    setItems(updated);
    calculateTotal(updated);
  };

  // Calculate total
  const calculateTotal = (list) => {
    const sum = list.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotal(sum);
  };

  // Submit sale
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomer || items.length === 0) {
      alert("Please select a customer and at least one product.");
      return;
    }

    try {
      // 1️⃣ Create sale
      const saleRes = await axios.post(
        `${BASE_URL}/sales`,
        { customer_id: selectedCustomer, total_amount: total },
        { headers }
      );
      const sale_id = saleRes.data.sales_id;

      // 2️⃣ Add items to sale
      for (const item of items) {
        const product = inventory.find((p) => p.product_id == item.product_id);
        if (!product) continue;

        if (item.quantity > product.stock) {
          alert(
            `Not enough stock for ${product.name}. Available: ${product.stock}`
          );
          continue;
        }

        await axios.post(
          `${BASE_URL}/sales/${sale_id}/items`,
          { product_id: item.product_id, quantity: item.quantity },
          { headers }
        );

        // 3️⃣ Update stock
        const newStock = product.stock - item.quantity;
        await axios.put(
          `${BASE_URL}/inventory/${item.product_id}`,
          { name: product.name, price: product.price, stock: newStock },
          { headers }
        );

        if (newStock <= 0) {
          alert(`⚠️ ${product.name} is out of stock!`);
        }
      }

      alert("✅ Sale recorded successfully!");
      setSelectedCustomer("");
      setItems([]);
      setTotal(0);
      fetchSales();
      fetchInventory();
    } catch (err) {
      console.error("Error recording sale:", err);
      alert("❌ Failed to record sale");
    }
  };

  return (
    <div className="p-6 font-serif text-deep-purple">
      <h1 className="text-3xl font-bold mb-4">Record Sale</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      {loading && (
        <div className="bg-blue-100 text-blue-700 p-3 rounded mb-4">
          Loading data...
        </div>
      )}

      {/* Sale Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        {/* Select Customer */}
        <div className="mb-4">
          <label className="block mb-1">Customer</label>
          <select
            className="border p-2 w-full"
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
          >
            <option value="">Select customer</option>
            {customers.map((c) => (
              <option key={c.customer_id} value={c.customer_id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Product Lines */}
        <div>
          {items.map((item, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <select
                className="border p-2 flex-1"
                value={item.product_id}
                onChange={(e) =>
                  updateItem(index, "product_id", e.target.value)
                }
              >
                <option value="">Select product</option>
                {inventory.map((p) => (
                  <option key={p.product_id} value={p.product_id}>
                    {p.name} (Stock: {p.stock})
                  </option>
                ))}
              </select>
              <input
                type="number"
                className="border p-2 w-24"
                min="1"
                value={item.quantity}
                onChange={(e) =>
                  updateItem(index, "quantity", parseInt(e.target.value))
                }
              />
              <span className="p-2 w-24">${item.price}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addItem}
          className="bg-purple-500 text-white px-4 py-2 mt-2 rounded"
        >
          Add Product
        </button>

        <div className="mt-4 font-bold">Total: ${total.toFixed(2)}</div>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 mt-2 rounded"
        >
          Submit Sale
        </button>
      </form>

      {/* Sales Table */}
      <h2 className="text-xl font-bold mb-2">Past Sales</h2>
      <SalesTable sales={sales} />
    </div>
  );
};

export default Sales;
